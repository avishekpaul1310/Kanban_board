# Kanban Board

![Kanban Board Preview](assets/images/kanban-preview.png)

## Overview

Kanban Board is a feature-rich task management web application built with vanilla JavaScript, CSS, and HTML. It implements the Kanban methodology for visualizing workflows and maximizing efficiency through a clean, intuitive interface.

## Features

- **Task Management**: Create, edit, and delete tasks with an intuitive drag-and-drop interface
- **Task Categorization**: Organize tasks with custom categories and priority levels
- **Progress Tracking**: Monitor task completion with visual progress indicators
- **Task Timer**: Built-in Pomodoro timer for time management (25-minute focus sessions)
- **Data Visualization**: Analytics dashboard with task distribution charts
- **Filtering and Sorting**: Find tasks easily with powerful filtering and multiple sorting options
- **Data Persistence**: Automatic saving of board state using localStorage
- **Import/Export**: Share your kanban board via JSON export/import functionality
- **User Authentication**: Simple user registration and login system
- **Responsive Design**: Works on both desktop and mobile devices

## Live Demo

[View Live Demo](https://avishekpaul1310.github.io/Kanban_board/) <!-- Update this URL once deployed -->

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/avishekpaul1310/Kanban_board.git
   ```

2. Navigate to the project directory:
   ```
   cd Kanban_board
   ```

3. Open `index.html` in your preferred browser:
   ```
   open index.html   # On macOS
   start index.html  # On Windows
   ```

## Usage

### User Registration and Login
- Register with a username and password
- Login to access your personal kanban board

### Task Creation
1. Enter task details in the input field at the top
2. Select priority, category, and due date
3. Click "Add Task" to create the task in the "To Do" column

### Task Management
- Drag and drop tasks between columns ("To Do", "In Progress", "Done")
- Double click on task text to edit
- Use + and - buttons to update progress percentage
- Click the timer button to start a 25-minute Pomodoro timer

### Filtering and Sorting
- Use the search box to filter tasks by name or category
- Use the sort dropdown to arrange tasks by various criteria

### Data Management
- Board state is automatically saved to your browser's localStorage
- Use Export/Import buttons to backup or transfer your board data

## Development

### Project Structure
```
.
├── index.html          # Main HTML structure
├── css/
│   └── styles.css      # Styling for the application
├── js/
│   └── main.js         # JavaScript functionality
└── assets/
    └── images/         # Images for documentation and UI
```

### Future Enhancements
- Team collaboration features
- Multiple board support
- Customizable columns
- More advanced analytics
- Backend integration for persistent storage

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For more details, see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Avishek Paul - [GitHub Profile](https://github.com/avishekpaul1310)

Project Link: [https://github.com/avishekpaul1310/Kanban_board](https://github.com/avishekpaul1310/Kanban_board)
