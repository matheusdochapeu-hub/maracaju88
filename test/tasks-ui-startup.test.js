import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getInitialState } from '../js/storage.js';
import { renderTasksTab } from '../js/ui.js';
import { applyCloudBackup } from '../js/sheets.js';
import {
  isTaskScheduledForDate,
  formatTaskWeekDays,
  getTasksProgressByFrequency,
  getAllFrequenciesSummary
} from '../js/tasks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Tasks UI: renderTasksTab executes cleanly without missing references', () => {
  const state = getInitialState();

  // Add dummy tasks including weekDays and legacy dias_alternados
  state.tasks.push({
    id: 'test_trash_1',
    title: 'Tirar o lixo orgânico',
    room: 'cozinha',
    frequency: 'diaria',
    weekDays: [2, 4, 6],
    assignedTo: 'matheus'
  });

  state.tasks.push({
    id: 'test_legacy_1',
    title: 'Lavar roupas de cama',
    room: 'lavanderia',
    frequency: 'dias_alternados',
    assignedTo: 'scarlet'
  });

  const elements = {};
  global.document = {
    getElementById: (id) => {
      if (!elements[id]) {
        elements[id] = {
          id,
          innerHTML: '',
          style: {},
          classList: { toggle: () => {}, add: () => {}, remove: () => {} },
          setAttribute: () => {},
          getAttribute: () => null
        };
      }
      return elements[id];
    }
  };

  assert.doesNotThrow(() => {
    renderTasksTab(state, 'diaria', 'tudo');
  });

  assert.ok(elements['tasks-list'].innerHTML.includes('Tirar o lixo orgânico'));
  assert.ok(elements['frequency-segmented-bar'].innerHTML.includes('Diárias'));
  assert.ok(elements['daily-progress-card'].innerHTML.includes('Tarefas'));
  assert.ok(elements['room-chips-container'].innerHTML.includes('Todos os Cômodos'));
});

test('Sheets: applyCloudBackup sanitizes legacy tasks and preserves local items', () => {
  const localState = getInitialState();
  localState.tasks = [
    {
      id: 'local_offline_1',
      title: 'Tarefa criada offline',
      room: 'sala',
      frequency: 'diaria',
      assignedTo: 'matheus'
    }
  ];

  const cloudData = {
    tasks: [
      {
        id: 'task_1',
        title: 'Lavar louça',
        room: 'cozinha',
        frequency: 'diaria',
        assignedTo: 'ambos'
      },
      {
        id: 'task_legacy',
        title: 'Regar plantas',
        room: 'cuidados',
        frequency: 'dias_alternados',
        assignedTo: 'scarlet'
      }
    ],
    history: {
      '2026-11-05': {
        task_1: { done: true, doneBy: 'Matheus' }
      }
    }
  };

  const merged = applyCloudBackup(localState, cloudData);

  // Both local offline task and cloud tasks must be present
  assert.equal(merged.tasks.length, 3);
  const offlineTask = merged.tasks.find(t => t.id === 'local_offline_1');
  assert.ok(offlineTask, 'Offline task must be retained');

  const legacyTask = merged.tasks.find(t => t.id === 'task_legacy');
  assert.ok(legacyTask);
  assert.equal(legacyTask.frequency, 'diaria', 'Legacy dias_alternados must be converted to diaria');
  assert.deepEqual(legacyTask.weekDays, [1, 3, 5], 'Default weekDays assigned to legacy dias_alternados');

  // If cloud returns empty tasks array, it should NOT wipe out local tasks
  const mergedEmpty = applyCloudBackup(localState, { tasks: [] });
  assert.equal(mergedEmpty.tasks.length, 1);
  assert.equal(mergedEmpty.tasks[0].id, 'local_offline_1');
});

test('Tasks UI: formatTaskWeekDays is imported and works in task editing flow', () => {
  assert.equal(formatTaskWeekDays([0, 1, 2, 3, 4, 5, 6]), 'Todos os dias');
  assert.equal(formatTaskWeekDays([2, 4, 6]), 'Ter, Qui, Sáb');
  assert.equal(formatTaskWeekDays([1, 2, 3, 4, 5]), 'Segunda a Sexta');
  assert.equal(formatTaskWeekDays([0, 6]), 'Fim de semana');
  assert.equal(formatTaskWeekDays([]), 'Todos os dias');

  const appJs = fs.readFileSync(path.resolve(__dirname, '../js/app.js'), 'utf-8');
  assert.ok(
    appJs.includes('formatTaskWeekDays'),
    'js/app.js must import formatTaskWeekDays from ./tasks.js'
  );
  assert.match(
    appJs,
    /import\s*\{[^}]*formatTaskWeekDays[^}]*\}\s*from\s*['"]\.\/tasks\.js['"]/,
    'js/app.js must have formatTaskWeekDays in the tasks.js import statement'
  );
});
