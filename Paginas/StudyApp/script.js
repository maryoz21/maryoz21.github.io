// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAwDdAHIxRLFPQVe1ki9fDvA7ZRgLAq8g8",
    authDomain: "studyapp-eea89.firebaseapp.com",
    projectId: "studyapp-eea89",
    storageBucket: "studyapp-eea89.appspot.com",
    messagingSenderId: "1012643526390",
    appId: "1:1012643526390:web:e18aeea308849fe11aded7",
    measurementId: "G-PGSYTS6WBS"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  document.addEventListener('DOMContentLoaded', function() {
      // Authentication
      const loginForm = document.getElementById('loginForm');
      const signupForm = document.getElementById('signupForm');
      const logoutButton = document.getElementById('logoutButton');
      const showSignupLink = document.getElementById('showSignup');
      const showLoginLink = document.getElementById('showLogin');
  
      loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const email = document.getElementById('loginEmail').value;
          const password = document.getElementById('loginPassword').value;
          auth.signInWithEmailAndPassword(email, password)
              .then(() => {
                  console.log('Usuario ha iniciado sesión');
              })
              .catch((error) => {
                  console.error('Error de inicio de sesión:', error);
              });
      });
  
      signupForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const email = document.getElementById('signupEmail').value;
          const password = document.getElementById('signupPassword').value;
          auth.createUserWithEmailAndPassword(email, password)
              .then(() => {
                  console.log('Usuario registrado');
              })
              .catch((error) => {
                  console.error('Error de registro:', error);
              });
      });
  
      logoutButton.addEventListener('click', () => {
          auth.signOut().then(() => {
              console.log('Usuario ha cerrado sesión');
          }).catch((error) => {
              console.error('Error al cerrar sesión:', error);
          });
      });
  
      showSignupLink.addEventListener('click', (e) => {
          e.preventDefault();
          document.getElementById('loginContainer').style.display = 'none';
          document.getElementById('signupContainer').style.display = 'block';
      });
  
      showLoginLink.addEventListener('click', (e) => {
          e.preventDefault();
          document.getElementById('signupContainer').style.display = 'none';
          document.getElementById('loginContainer').style.display = 'block';
      });
  
      auth.onAuthStateChanged((user) => {
          if (user) {
              document.getElementById('loginContainer').style.display = 'none';
              document.getElementById('signupContainer').style.display = 'none';
              document.getElementById('appContainer').style.display = 'block';
              loadUserData(user.uid);
          } else {
              document.getElementById('loginContainer').style.display = 'block';
              document.getElementById('signupContainer').style.display = 'none';
              document.getElementById('appContainer').style.display = 'none';
          }
      });
  
      // Tab functionality
      const navButtons = document.querySelectorAll('.nav-button');
      const tabContents = document.querySelectorAll('.tab-content');
  
      navButtons.forEach(button => {
          button.addEventListener('click', () => {
              const tabId = button.getAttribute('data-tab');
              navButtons.forEach(btn => btn.classList.remove('active'));
              tabContents.forEach(content => content.classList.remove('active'));
              button.classList.add('active');
              document.getElementById(tabId).classList.add('active');
          });
      });
  
      // Dark mode toggle
      const darkModeToggle = document.getElementById('darkModeToggle');
      const body = document.body;
  
      darkModeToggle.addEventListener('click', () => {
          body.classList.toggle('dark-mode');
          const isDarkMode = body.classList.contains('dark-mode');
          localStorage.setItem('darkMode', isDarkMode);
          darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
          updateCalendar();
      });
  
      // Check for saved dark mode preference
      if (localStorage.getItem('darkMode') === 'true') {
          body.classList.add('dark-mode');
          darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      }
  
      // Data
      let tasks = [];
      let exams = [];
      let notes = [];
      let studySessions = [];
  
      // Agenda functionality
      let currentWeekStart = getStartOfWeek(new Date());
  
      function getStartOfWeek(date) {
          const diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
          return new Date(date.setDate(diff));
      }
  
      function updateAgenda() {
          const weeklyAgenda = document.getElementById('weeklyAgenda');
          weeklyAgenda.innerHTML = '';
  
          for (let i = -2; i < 7; i++) {
              const day = new Date(currentWeekStart);
              day.setDate(day.getDate() + i);
              const dayElement = document.createElement('div');
              dayElement.className = 'agenda-day';
              if (i < 0) dayElement.classList.add('past');
              dayElement.innerHTML = `
                  <h3>${day.toLocaleDateString('es-ES', { weekday: 'short' })} ${day.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</h3>
              `;
  
              const dayTasks = tasks.filter(task => new Date(task.date).toDateString() === day.toDateString());
              dayTasks.forEach(task => {
                  const taskElement = document.createElement('div');
                  taskElement.className = `task-item${task.done ? ' done' : ''}`;
                  taskElement.innerHTML = `
                      <div>
                          <strong>${task.title}</strong>
                          <p class="notes">${task.notes}</p>
                      </div>
                      <div>
                          <button class="done-button" data-id="${task.id}">${task.done ? 'Deshacer' : 'Hecho'}</button>
                          <button class="edit-button" data-id="${task.id}" data-type="task">Editar</button>
                      </div>
                  `;
                  dayElement.appendChild(taskElement);
              });
  
              const dayExams = exams.filter(exam => new Date(exam.date).toDateString() === day.toDateString());
              dayExams.forEach(exam => {
                  const examElement = document.createElement('div');
                  examElement.className = 'exam-item';
                  examElement.innerHTML = `
                      <div>
                          <strong>${exam.title} (${exam.subject})</strong>
                          <p class="notes">${exam.notes}</p>
                          ${exam.grade !== null ? `<p>Nota: ${exam.grade}</p>` : ''}
                      </div>
                      <button class="edit-button" data-id="${exam.id}" data-type="exam">Editar</button>
                  `;
                  dayElement.appendChild(examElement);
              });
  
              const dayNotes = notes.filter(note => new Date(note.date).toDateString() === day.toDateString());
              dayNotes.forEach(note => {
                  const noteElement = document.createElement('div');
                  noteElement.className = 'note-item';
                  noteElement.innerHTML = `
                      <div>
                          <strong>${note.title}</strong>
                          <p class="notes">${note.notes}</p>
                      </div>
                      <button class="edit-button" data-id="${note.id}" data-type="note">Editar</button>
                  `;
                  dayElement.appendChild(noteElement);
              });
  
              weeklyAgenda.appendChild(dayElement);
          }
  
          document.getElementById('currentWeek').textContent = `${currentWeekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
      }
  
      document.getElementById('prevWeek').addEventListener('click', () => {
          currentWeekStart.setDate(currentWeekStart.getDate() - 7);
          updateAgenda();
      });
  
      document.getElementById('nextWeek').addEventListener('click', () => {
          currentWeekStart.setDate(currentWeekStart.getDate() + 7);
          updateAgenda();
      });
  
      // Add item functionality
      const itemTypeSelect = document.getElementById('itemType');
      const examSubjectInput = document.getElementById('examSubject');
  
      itemTypeSelect.addEventListener('change', function() {
          examSubjectInput.style.display = this.value === 'exam' ? 'block' : 'none';
      });
  
      document.getElementById('addItemForm').addEventListener('submit', function(e) {
          e.preventDefault();
          const type = document.getElementById('itemType').value;
          const title = document.getElementById('itemTitle').value;
          const date = new Date(document.getElementById('itemDate').value);
          const notes = document.getElementById('itemNotes').value;
  
          if (type === 'task') {
              tasks.push({ id: Date.now(), title, date, notes, done: false });
          } else if (type === 'exam') {
              const subject = document.getElementById('examSubject').value;
              exams.push({ id: Date.now(), title, date, subject, notes, grade: null });
          } else if (type === 'note') {
              notes.push({ id: Date.now(), title, date, notes });
          }
  
          updateAgenda();
          updateCalendar();
          updateExams();
          updateExamResults();
          saveUserData();
          this.reset();
          examSubjectInput.style.display = 'none';
      });
  
      // Study functionality
      let studyDuration = 25;
      let restDuration = 5;
      let isStudying = false;
      let timeLeft = studyDuration * 60;
      let timer;
      let isStudyPhase = true;
      let studyStartTime;
  
      const timerDisplay = document.getElementById('timer');
      const startStudyBtn = document.getElementById('startStudyBtn');
      const resetStudyBtn = document.getElementById('resetStudyBtn');
      const finishStudyBtn = document.getElementById('finishStudyBtn');
  
      document.getElementById('studyDuration').addEventListener('change', function() {
          studyDuration = parseInt(this.value);
          if (!isStudying) {
              timeLeft = studyDuration * 60;
              updateTimerDisplay();
          }
      });
  
      document.getElementById('restDuration').addEventListener('change', function() {
          restDuration = parseInt(this.value);
      });
  
      startStudyBtn.addEventListener('click', toggleStudySession);
      resetStudyBtn.addEventListener('click', resetStudySession);
      finishStudyBtn.addEventListener('click', finishStudySession);
  
      function toggleStudySession() {
          if (!isStudying) {
              startStudySession();
          } else {
              pauseStudySession();
          }
      }
  
      function startStudySession() {
          isStudying = true;
          startStudyBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pausar</span>';
          timer = setInterval(updateTimer, 1000);
          if (isStudyPhase && !studyStartTime) {
              studyStartTime = new Date();
          }
      }
  
      function pauseStudySession() {
          isStudying = false;
          startStudyBtn.innerHTML = '<i class="fas fa-play"></i><span>Reanudar</span>';
          clearInterval(timer);
      }
  
      function resetStudySession() {
          pauseStudySession();
          isStudyPhase = true;
          timeLeft = studyDuration * 60;
          startStudyBtn.innerHTML = '<i class="fas fa-play"></i><span>Iniciar</span>';
          updateTimerDisplay();
          studyStartTime = null;
      }
  
      function finishStudySession() {
          if (isStudying || studyStartTime) {
              const now = new Date();
              const duration = Math.round((now - studyStartTime) / 60000); // Convert to minutes
              studySessions.push({ date: now, duration: duration });
              updateStudySessions();
              updateStudyHistory();
              updateStudyMoodIndicator();
              saveUserData();
              resetStudySession();
          }
      }
  
      function updateTimer() {
          timeLeft--;
          updateTimerDisplay();
  
          if (timeLeft === 0) {
              clearInterval(timer);
              isStudying = false;
              if (isStudyPhase) {
                  finishStudySession();
                  isStudyPhase = false;
                  timeLeft = restDuration * 60;
                  startStudyBtn.innerHTML = '<i class="fas fa-play"></i><span>Iniciar Descanso</span>';
              } else {
                  isStudyPhase = true;
                  timeLeft = studyDuration * 60;
                  startStudyBtn.innerHTML = '<i class="fas fa-play"></i><span>Iniciar Estudio</span>';
                  studyStartTime = null;
              }
              updateTimerDisplay();
          }
      }
  
      function updateTimerDisplay() {
          const minutes = Math.floor(timeLeft / 60);
          const seconds = timeLeft % 60;
          timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
  
      function updateStudySessions() {
          const sessionsContainer = document.getElementById('studySessions');
          sessionsContainer.innerHTML = '';
          const today = new Date().toDateString();
          const todaySessions = studySessions.filter(session => new Date(session.date).toDateString() === today);
          todaySessions.forEach(session => {
              const sessionElement = document.createElement('div');
              sessionElement.innerHTML = `
                  <i class="fas fa-check-circle"></i>
                  ${new Date(session.date).toLocaleTimeString('es-ES')} - ${session.duration} minutos
              `;
              sessionsContainer.appendChild(sessionElement);
          });
      }
  
      function updateStudyHistory() {
          const historyContainer = document.getElementById('studyHistory');
          historyContainer.innerHTML = '';
          
          const groupedSessions = groupSessionsByDate(studySessions);
          
          for (const [date, sessions] of Object.entries(groupedSessions)) {
              const historyItem = document.createElement('div');
              historyItem.className = 'history-item';
              const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
              historyItem.innerHTML = `
                  <h3>${new Date(date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                  <p>Tiempo total de estudio: ${totalDuration} minutos</p>
                  <p>Sesiones: ${sessions.length}</p>
              `;
              historyContainer.appendChild(historyItem);
          }
      }
  
      function groupSessionsByDate(sessions) {
          return sessions.reduce((groups, session) => {
              const date = new Date(session.date).toDateString();
              if (!groups[date]) {
                  groups[date] = [];
              }
              groups[date].push(session);
              return groups;
          }, {});
      }
  
      function updateStudyMoodIndicator() {
          const moodIndicator = document.getElementById('studyMoodIndicator');
          const totalStudyTimeElement = document.getElementById('totalStudyTime');
          const today = new Date().toDateString();
          const todaySessions = studySessions.filter(session => new Date(session.date).toDateString() === today);
          const totalStudyTime = todaySessions.reduce((sum, session) => sum + session.duration, 0);
  
          totalStudyTimeElement.textContent = `${totalStudyTime} minutos estudiados hoy`;
  
          const moodIcon = moodIndicator.querySelector('i');
          moodIcon.className = 'fas';
  
          if (totalStudyTime >= 120) {
              moodIcon.classList.add('fa-face-smile');
          } else if (totalStudyTime >= 60) {
              moodIcon.classList.add('fa-face-meh');
          } else {
              moodIcon.classList.add('fa-face-frown');
          }
      }
  
      // Calendar functionality
      let calendar;
  
      function initializeCalendar() {
          const calendarEl = document.getElementById('calendarView');
          calendar = new FullCalendar.Calendar(calendarEl, {
              initialView: 'dayGridMonth',
              headerToolbar: {
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
              },
              height: 'auto',
              events: getCalendarEvents(),
              eventClick: function(info) {
                  alert(`${info.event.title}\n\nNotas: ${info.event.extendedProps.notes}`);
              },
              locale: 'es'
          });
          calendar.render();
      }
  
      function getCalendarEvents() {
          const taskEvents = tasks.map(task => ({
              title: task.title,
              start: task.date,
              allDay: true,
              color: task.done ? 'green' : 'blue',
              extendedProps: { notes: task.notes }
          }));
  
          const examEvents = exams.map(exam => ({
              title: `${exam.title} (${exam.subject})`,
              start: exam.date,
              allDay: true,
              color: 'red',
              extendedProps: { notes: exam.notes }
          }));
  
          const noteEvents = notes.map(note => ({
              title: note.title,
              start: note.date,
              allDay: true,
              color: 'green',
              extendedProps: { notes: note.notes }
          }));
  
          return [...taskEvents, ...examEvents, ...noteEvents];
      }
  
      function updateCalendar() {
          if (calendar) {
              calendar.removeAllEvents();
              calendar.addEventSource(getCalendarEvents());
              calendar.render();
          }
      }
  
      // Exams functionality
      function updateExams() {
          const examsList = document.getElementById('examsList');
          examsList.innerHTML = '';
          exams.forEach(exam => {
              const examElement = document.createElement('div');
              examElement.className = 'exam-card';
              examElement.innerHTML = `
                  <h3>${exam.title}</h3>
                  <p>Asignatura: ${exam.subject}</p>
                  <p>Fecha: ${new Date(exam.date).toLocaleDateString('es-ES')}</p>
                  <p class="notes">${exam.notes}</p>
                  ${exam.grade !== null ? `<p>Nota: ${exam.grade}</p>` : ''}
                  <button class="edit-button" data-id="${exam.id}" data-type="exam">Editar</button>
              `;
              examsList.appendChild(examElement);
          });
      }
  
      // Exam Results functionality
      function updateExamResults() {
          const examResults = document.getElementById('examResults');
          examResults.innerHTML = '';
  
          const subjectResults = {};
          let totalGrade = 0;
          let totalExams = 0;
  
          exams.forEach(exam => {
              if (exam.grade !== null) {
                  if (!subjectResults[exam.subject]) {
                      subjectResults[exam.subject] = [];
                  }
                  subjectResults[exam.subject].push(exam.grade);
                  totalGrade += exam.grade;
                  totalExams++;
              }
          });
  
          for (const [subject, grades] of Object.entries(subjectResults)) {
              const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
              const resultElement = document.createElement('div');
              resultElement.className = 'exam-result';
              resultElement.innerHTML = `
                  <h3>${subject}</h3>
                  <p>Promedio: ${average.toFixed(2)}</p>
                  <p>Notas: ${grades.join(', ')}</p>
              `;
              examResults.appendChild(resultElement);
          }
  
          if (totalExams > 0) {
              const overallAverage = totalGrade / totalExams;
              const overallElement = document.createElement('div');
              overallElement.className = 'exam-result overall';
              overallElement.innerHTML = `
                  <h3>Promedio General</h3>
                  <p>Promedio de todos los exámenes: ${overallAverage.toFixed(2)}</p>
                  <p>Total de exámenes: ${totalExams}</p>
              `;
              examResults.appendChild(overallElement);
          }
      }
  
      // Edit functionality
      const modal = document.getElementById('editModal');
      const closeBtn = document.getElementsByClassName('close')[0];
      const editForm = document.getElementById('editItemForm');
  
      // Close modal when clicking on x
      closeBtn.onclick = function() {
          modal.style.display = 'none';
      }
  
      // Close modal when clicking outside of it
      window.onclick = function(event) {
          if (event.target == modal) {
              modal.style.display = 'none';
          }
      }
  
      // Open edit modal
      document.addEventListener('click', function(e) {
          if (e.target && e.target.classList.contains('edit-button')) {
              const id = parseInt(e.target.getAttribute('data-id'));
              const type = e.target.getAttribute('data-type');
              openEditModal(id, type);
          }
          if (e.target && e.target.classList.contains('done-button')) {
              const id = parseInt(e.target.getAttribute('data-id'));
              toggleTaskDone(id);
          }
      });
  
      function openEditModal(id, type) {
          let item;
          if (type === 'task') {
              item = tasks.find(t => t.id === id);
          } else if (type === 'exam') {
              item = exams.find(e => e.id === id);
          } else if (type === 'note') {
              item = notes.find(n => n.id === id);
          }
  
          if (item) {
              document.getElementById('editItemId').value = item.id;
              document.getElementById('editItemType').value = type;
              document.getElementById('editItemTitle').value = item.title;
              document.getElementById('editItemDate').value = new Date(item.date).toISOString().slice(0, 16);
              document.getElementById('editItemNotes').value = item.notes;
              if (type === 'exam') {
                  document.getElementById('editExamSubject').value = item.subject;
                  document.getElementById('editExamSubject').style.display = 'block';
                  document.getElementById('editExamGrade').value = item.grade !== null ? item.grade : '';
                  document.getElementById('editExamGrade').style.display = 'block';
              } else {
                  document.getElementById('editExamSubject').style.display = 'none';
                  document.getElementById('editExamGrade').style.display = 'none';
              }
              modal.style.display = 'block';
          }
      }
  
      // Handle edit form submission
      editForm.addEventListener('submit', function(e) {
          e.preventDefault();
          const id = parseInt(document.getElementById('editItemId').value);
          const type = document.getElementById('editItemType').value;
          const title = document.getElementById('editItemTitle').value;
          const date = new Date(document.getElementById('editItemDate').value);
          const notes = document.getElementById('editItemNotes').value;
  
          if (type === 'task') {
              const taskIndex = tasks.findIndex(t => t.id === id);
              if (taskIndex !== -1) {
                  tasks[taskIndex] = { ...tasks[taskIndex], title, date, notes };
              }
          } else if (type === 'exam') {
              const subject = document.getElementById('editExamSubject').value;
              const grade = document.getElementById('editExamGrade').value !== '' ? parseFloat(document.getElementById('editExamGrade').value) : null;
              const examIndex = exams.findIndex(e => e.id === id);
              if (examIndex !== -1) {
                  exams[examIndex] = { ...exams[examIndex], title, date, subject, notes, grade };
              }
          } else if (type === 'note') {
              const noteIndex = notes.findIndex(n => n.id === id);
              if (noteIndex !== -1) {
                  notes[noteIndex] = { ...notes[noteIndex], title, date, notes };
              }
          }
  
          updateAgenda();
          updateCalendar();
          updateExams();
          updateExamResults();
          saveUserData();
          modal.style.display = 'none';
      });
  
      function toggleTaskDone(id) {
          const taskIndex = tasks.findIndex(t => t.id === id);
          if (taskIndex !== -1) {
              tasks[taskIndex].done = !tasks[taskIndex].done;
              updateAgenda();
              updateCalendar();
              saveUserData();
          }
      }
  
      // Data persistence
      function saveUserData() {
          const userId = auth.currentUser.uid;
          db.collection('users').doc(userId).set({
              tasks: tasks,
              exams: exams,
              notes: notes,
              studySessions: studySessions
          })
          .then(() => {
              console.log('Datos guardados correctamente');
          })
          .catch((error) => {
              console.error('Error al guardar datos:', error);
          });
      }
  
      function loadUserData(userId) {
          db.collection('users').doc(userId).get()
          .then((doc) => {
              if (doc.exists) {
                  const data = doc.data();
                  tasks = data.tasks || [];
                  exams = data.exams || [];
                  notes = data.notes || [];
                  studySessions = data.studySessions || [];
                  updateAgenda();
                  updateCalendar();
                  updateExams();
                  updateExamResults();
                  updateStudyHistory();
                  updateStudyMoodIndicator();
              } else {
                  console.log('No se encontraron datos para este usuario');
              }
          })
          .catch((error) => {
              console.error('Error al cargar datos:', error);
          });
      }
  
      // Initialize everything
      updateAgenda();
      initializeCalendar();
      updateExams();
      updateExamResults();
      updateStudyHistory();
      updateStudyMoodIndicator();
      updateTimerDisplay();
  });