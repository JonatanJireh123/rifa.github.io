document.addEventListener('DOMContentLoaded', () => {
    const nameForm = document.getElementById('nameForm');
    const nameInput = document.getElementById('nameInput');
    const nameList = document.getElementById('nameList');
    const selectRandomButton = document.getElementById('selectRandom');
    const congratsDisplay = document.getElementById('congrats');
    const randomNameDisplay = document.getElementById('randomName');
    const fileInput = document.getElementById('fileInput');
    const loadExcelButton = document.getElementById('loadExcel');

    // Recuperar nombres almacenados en localStorage
    const names = JSON.parse(localStorage.getItem('names')) || [];

    // Actualizar la lista de nombres en el DOM
    const updateNameList = () => {
        if (nameList) {
            nameList.innerHTML = '';
            names.forEach((entry) => {
                const li = document.createElement('li');
                li.textContent = `${entry.id}. ${entry.name}`;
                nameList.appendChild(li);
            });
        }
    };

    // Manejar el envío del formulario para agregar un nuevo nombre
    if (nameForm) {
        nameForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const name = nameInput.value.trim();
            if (name) {
                const newId = names.length > 0 ? names[names.length - 1].id + 1 : 1;
                names.push({ id: newId, name });
                localStorage.setItem('names', JSON.stringify(names));
                nameInput.value = '';
                updateNameList();
            }
        });
    }

    // Función para mostrar el nombre letra por letra
    const typeWriter = (text, element, interval, callback) => {
        let index = 0;
        element.textContent = '';
        const typingInterval = setInterval(() => {
            element.textContent += text[index];
            index++;
            if (index === text.length) {
                clearInterval(typingInterval);
                if (callback) {
                    callback();
                }
            }
        }, interval);
    };

    // Manejar la selección aleatoria de un nombre con animación de ruleta
    if (selectRandomButton) {
        selectRandomButton.addEventListener('click', () => {
            const storedNames = JSON.parse(localStorage.getItem('names')) || [];
            if (storedNames.length > 0) {
                const drumrollAudio = new Audio('drumroll.mp3');
                drumrollAudio.play();
                
                const animationDuration = 4500; // Duración de la animación en milisegundos
                const intervalDuration = 100; // Duración del intervalo para cambiar los nombres
                let elapsed = 0;

                const interval = setInterval(() => {
                    const randomindex = Math.floor(Math.random() * storedNames.length);
                    randomNameDisplay.textContent = storedNames[randomindex].name;
                    elapsed += intervalDuration;
                    if (elapsed >= animationDuration) {
                        clearInterval(interval);
                        const selectedindex = Math.floor(Math.random() * storedNames.length);
                        const selectedEntry = storedNames.splice(selectedindex, 1)[0];
                        congratsDisplay.textContent = '¡Felicidades!';
                        typeWriter(selectedEntry.name, randomNameDisplay, 1500, () => {
                            randomNameDisplay.classList.add('winner');
                            localStorage.setItem('names', JSON.stringify(storedNames));
                            updateNameList();
                        });
                    }
                }, intervalDuration);
            } else {
                randomNameDisplay.textContent = 'No hay nombres registrados.';
            }
        });
    }

    // Leer el archivo Excel y cargar los nombres
    const handleFile = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            rows.forEach((row, index) => {
                if (index > 0 && row[0] && row[1]) { // Asumiendo que la primera fila es el encabezado
                    names.push({ id: row[0], name: row[1] });
                }
            });

            localStorage.setItem('names', JSON.stringify(names));
            updateNameList();
        };
        reader.readAsArrayBuffer(file);
    };

    if (fileInput) {
        fileInput.addEventListener('change', handleFile, false);
    }

    updateNameList();
});
