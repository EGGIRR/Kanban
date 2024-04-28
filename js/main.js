Vue.component('add-task', {
    template: `
    <div>
    <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
            <li v-for="error in errors">{{ error }}</li>
        </ul>
    </p>
        <h2>Create task</h2>
        <div>
        <label>Task title:
         <input placeholder="New task" v-model="task.title">
         </label>
        <h3>Tasks</h3>
        <div v-for="(subtask, index) in task.subtasks"><input placeholder="Task" v-model="subtask.title" :key="index">
        </div>
        <div>
    <input type="radio" id="yes" name="drone" v-model="task.importance" value="1"/>
    <label for="yes">Important</label>
  </div>

  <div>
    <input type="radio" id="no" name="drone" v-model="task.importance" value="0" />
    <label for="no">Common</label>
  </div>
  <input type="date" v-model="task.deadline_date">
        <button @click="addTask">add</button>
        </div>
    </div>
    `,
    methods: {
        addTask() {
            this.errors = [];
            if (!this.task.title || this.task.subtasks.filter(subtask => subtask.title).length < 3 || !this.task.deadline_date) {
                if (!this.task.title) this.errors.push("Title required.");
                if (this.task.subtasks.filter(subtask => subtask.title).length < 3) this.errors.push("You must have at least 3 filled titles.");
                if (!this.task.deadline_date) this.errors.push("Deadline required.");
                return;
            }
            let productReview = {
                title: this.task.title,
                subtasks: this.task.subtasks.filter(subtask => subtask.title),
                date: this.task.date,
                importance: this.task.importance,
                deadline_date: this.task.deadline_date
            };
            this.$emit('add-task', productReview);
            location.reload();
        },
    },
    data() {
        return {
            errors: [],
            task: {
                title: 'New task',
                subtasks: [
                    {title: "Task 1", done: false},
                    {title: "Task 2", done: false},
                    {title: "Task 3", done: false},
                ],
                importance: 1,
                deadline_date: '',
                date: new Date().getFullYear() + '-' + (new Date().getMonth()+1) + '-' + new Date().getDate(),
            }
        }
    },
})

Vue.component('column', {
    props: {
        column: {
            title: '',
            tasks: [],
            date: '',
            deadline_date: ''
        }
    },
    template: `
    <div class="column">
        <h2>{{column.title}}</h2>
        <div class="task">
        <task v-for="(task, index) in sortedTasks"
        :key="index"
        :task="task"
        @del-task="delTask"
        @move-task="move"
        @move-task2="move2"
        @update-task="updateTask">
    </task>
        </div>
    </div>
    `,
    updated() {
        this.$emit('save')
    },
    methods: {
        move(task) {
            this.$emit('move-task', { task, column: this.column });
        },
        move2(task) {
            this.$emit('move-task2', { task, column: this.column });
        },
        delTask(task){
            this.$emit('del-task', task);
        },
        updateTask(task) {
            this.$emit('save');
        },
    },
    computed: {
        sortedTasks() {
            return this.column.tasks.sort((a, b) => b.importance - a.importance);
        }
    }
})

Vue.component('task', {
    props: {
        task: {
            title: '',
            subtasks: [],
            importance: ''
        }
    },
    template: `
    <div>
  <h2>{{ task.title }}</h2>
  <li v-for="(subtask, index) in task.subtasks" class="subtask" :key="index">
    {{ subtask.title }}
  </li>
  <p>Дата изменения: {{ task.date }}</p>
  <p>Предпологаемая дата сдачи: {{ task.deadline_date }}</p>
  <p v-if="task.importance === 1">Важно</p>
  <p v-else>Обычно</p>
  <button @click="delTask">Удалить задачу</button>
  <button @click="move2"><--</button>
  <button @click="move">--></button>
</div>
    `,
    methods: {
        delTask(task){
            this.$emit('del-task', task);
        },
        move() {
            this.$emit('move-task', { task: this.task, column: this.$parent.column });
        },
        move2() {
            this.$emit('move-task2', { task: this.task, column: this.$parent.column });
        },
    },
    computed: {
        isLastColumn() {
            return this.$parent.column.index === 3;
        },
    }
})

let app = new Vue({
    el: '#app',
    data: {
        columns: [
            {
                disabled: false,
                index: 0,
                title: "New tasks",
                tasks: [],
            },
            {
                index: 1,
                title: "Active",
                tasks: []
            },
            {
                index: 2,
                title: "Testing",
                tasks: [],
            },
            {
                index: 3,
                title: "Complete",
                tasks: [],
            },
        ]
    },
    mounted() {
        if (!localStorage.getItem('columns')) return
        this.columns = JSON.parse(localStorage.getItem('columns'));
    },
    methods: {
        save() {
            localStorage.setItem('columns', JSON.stringify(this.columns))
        },
        addTask(task) {
            if ((this.columns[0].tasks.length > 2) || this.columns[0].disabled) return
            this.columns[0].tasks.push(task)
        },
        delTask(task){
            this.columns[0].tasks.splice(task,1)
        },
        move(data) {
            const fromColumn = this.columns[data.column.index];
            const toColumn = this.columns[data.column.index + 1];
            if (toColumn) {
                data.task.date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate();
                toColumn.tasks.push(fromColumn.tasks.splice(fromColumn.tasks.indexOf(data.task), 1)[0]);
                this.save();
            }
        },
        move2(data) {
            const fromColumn = this.columns[data.column.index];
            const toColumn = this.columns[data.column.index - 1];
            if (toColumn) {
                data.task.date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate();
                toColumn.tasks.push(fromColumn.tasks.splice(fromColumn.tasks.indexOf(data.task), 1)[0]);
                this.save();
            }
        },
    },
})