# TaskFlow: Advanced Kanban Board Application

![TaskFlow Preview](assets/images/kanban-preview.png)

## Overview

TaskFlow is a feature-rich kanban board application designed to enhance productivity and task management. Built with modern web technologies, TaskFlow provides an intuitive interface for organizing workflow, tracking progress, and managing projects efficiently.

## Features

### Task Management
- Drag-and-drop interface for intuitive task movement between stages
- Create, edit, and delete tasks
- Set task priorities (Low, Medium, High)
- Assign categories (Work, Personal, Study, Health, Other)
- Set and track due dates with overdue highlighting

### Progress Tracking
- Visual progress bars for each task
- Increment/decrement progress by 10%
- Automatic task movement based on progress

### Time Management
- Built-in Pomodoro timer for each task
- Customizable timer duration
- Visual timer display and notifications

### User Authentication
- User registration and login system
- Personal board for each user
- Data persistence with localStorage

### Analytics
- Real-time statistics on task distribution
- Category breakdown with pie chart visualization
- Productivity metrics (completion rate, average progress)
- Task status visualization

### Additional Tools
- Filter tasks by text or category
- Sort tasks by multiple criteria (date, priority, alphabetical, etc.)
- Import/export functionality for board data
- Responsive design for desktop and mobile use

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Data Storage**: Browser's localStorage API
- **UI/UX**: Custom CSS with responsive design principles
- **Data Visualization**: Custom-built charts and analytics

## Installation and Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/taskflow.git
```

2. Navigate to the project directory:
```bash
cd taskflow
```

3. Open the application:
```bash
# If you have Python installed
python -m http.server 8000
# Then open http://localhost:8000 in your browser

# Alternatively, just open main.html in your browser
```

No build process or dependencies required - the application runs directly in modern browsers.

## Usage

1. Register an account or log in
2. Create tasks by filling out the form at the top
3. Drag tasks between columns (To Do, In Progress, Done)
4. Use the timer feature to practice Pomodoro technique
5. Track progress and update task statuses
6. Filter and sort tasks as needed
7. Export your board data for backup

## Future Enhancements

- Server-side storage with database integration
- Collaborative features for team projects
- Additional board customization options
- Mobile application version
- Expanded analytics features

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - avishek-paul@outlook.com

Project Link: [https://github.com/avishekpaul1310/taskflow](https://github.com/avishekpaul1310/taskflow)

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Inspired by Agile and Kanban methodologies
