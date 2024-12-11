// Task.ts: Representa uma única tarefa
class Task {
    constructor(
        public id: number, // ID único da tarefa
        public title: string, // Título da tarefa
        public description: string, // Descrição detalhada da tarefa
        public dueDate: Date, // Data de vencimento da tarefa
        public status: string = "pendente" // Status inicial da tarefa
    ) { }

    /**
     * Altera o status da tarefa.
     * @param newStatus Novo status da tarefa (ex: "concluída").
     */
    alterarStatus(newStatus: string): void {
        this.status = newStatus;
    }

    /**
     * Altera a descrição da tarefa.
     * @param newDescription Nova descrição da tarefa.
     */
    alterarDescricao(newDescription: string): void {
        this.description = newDescription;
    }

    /**
     * Altera a data de vencimento da tarefa.
     * @param newDueDate Nova data de vencimento.
     */
    alterarDataVencimento(newDueDate: Date): void {
        this.dueDate = newDueDate;
    }
}

// TaskRepository.ts: Gerencia as tarefas em memória
class TaskRepository {
    private tasks: Task[] = []; // Lista de tarefas armazenadas

    /**
     * Adiciona uma nova tarefa ao repositório.
     * @param task A tarefa a ser adicionada.
     */
    adicionarTarefa(task: Task): void {
        this.tasks.push(task);
    }

    /**
     * Remove uma tarefa do repositório pelo ID.
     * @param id O ID da tarefa a ser removida.
     */
    removeTask(id: number): void {
        this.tasks = this.tasks.filter(task => task.id !== id);
    }

    /**
     * Lista todas as tarefas do repositório.
     * @returns Lista de tarefas.
     */
    listarTarefas(): Task[] {
        return this.tasks;
    }

    /**
     * Busca uma tarefa pelo ID.
     * @param id O ID da tarefa a ser buscada.
     * @returns A tarefa encontrada ou undefined.
     */
    buscarTarefaPorId(id: number): Task | undefined {
        return this.tasks.find(task => task.id === id);
    }
}

// TaskService.ts: Lógica de negócios
class TaskService {
    constructor(private repository: TaskRepository) {}

    /**
     * Cria uma nova tarefa.
     * @param title O título da tarefa.
     * @param description A descrição da tarefa.
     * @param dueDate A data de vencimento da tarefa.
     * @returns A tarefa criada.
     */
    createTask(title: string, description: string, dueDate: Date): Task {
        const task = new Task(
            Date.now(), // Usando timestamp como ID único
            title,
            description,
            dueDate
        );
        this.repository.adicionarTarefa(task);
        return task;
    }

    /**
     * Conclui uma tarefa pelo ID.
     * @param id O ID da tarefa a ser concluída.
     */
    taskDone(id: number): void {
        const task = this.repository.buscarTarefaPorId(id);
        if (task) task.alterarStatus("concluída");
    }

    /**
     * Remove uma tarefa pelo ID.
     * @param id O ID da tarefa a ser removida.
     */
    removeTask(id: number): void {
        this.repository.removeTask(id);
    }

    /**
     * Lista todas as tarefas disponíveis.
     * @returns Lista de tarefas.
     */
    listarTarefas(): Task[] {
        return this.repository.listarTarefas();
    }
}

// TaskView.ts: Interage com o DOM
class TaskView {
    private taskContainer = document.getElementById("tasks-container")!;

    constructor(private taskService: TaskService) {}

    /**
     * Renderiza a lista de tarefas no DOM.
     */
    renderListTask(): void {
        const tasks = this.taskService.listarTarefas();
        this.taskContainer.innerHTML = "";
        tasks.forEach(task => {
            const taskElement = document.createElement("li");

            // Formatando a data para português
            const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "long", year: "numeric" };
            const formattedDate = task.dueDate.toLocaleDateString("pt-BR", options);

            taskElement.innerHTML = `
                <div class="task-info">
                    <strong>${task.title}</strong>
                    <p>${task.description}</p>
                    <small>Vence em: ${formattedDate}</small>
                    <small>Status: ${task.status}</small>
                </div>
                <div class="task-actions">
                    <button class="complete-task">Concluir</button>
                    <button class="delete-task">Remover</button>
                </div>
            `;

            // Adicionando eventos aos botões
            taskElement.querySelector(".complete-task")!.addEventListener("click", () => {
                this.taskService.taskDone(task.id);
                this.renderListTask();
            });

            taskElement.querySelector(".delete-task")!.addEventListener("click", () => {
                this.taskService.removeTask(task.id);
                this.renderListTask();
            });

            this.taskContainer.appendChild(taskElement);
        });
    }
}

// TaskManager.ts: Inicializa a aplicação
class TaskManager {
    private taskRepository = new TaskRepository();
    private taskService = new TaskService(this.taskRepository);
    private taskView = new TaskView(this.taskService);

    /**
     * Inicializa o sistema e configura eventos.
     */
    iniciar(): void {
        document.getElementById("form-create-task")!.addEventListener("submit", e => {
            e.preventDefault();
            const title = (document.getElementById("task-title") as HTMLInputElement).value;
            const description = (document.getElementById("task-description") as HTMLTextAreaElement).value;
            const dueDate = new Date((document.getElementById("task-due-date") as HTMLInputElement).value);

            this.taskService.createTask(title, description, dueDate);
            this.taskView.renderListTask();
        });

        this.taskView.renderListTask();
    }
}

// Inicializar o sistema
const taskManager = new TaskManager();
taskManager.iniciar();
