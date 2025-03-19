document.addEventListener("DOMContentLoaded", function () {
  initializeChart();
  initializeColorPickers();
});

let chart;
let activeColorPicker = null;

function initializeChart() {
  const ctx = document.getElementById("chart").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "График",
          data: [],
          borderColor: "#000000",
          backgroundColor: "#2828ff1f",
          borderWidth: 1,
          pointBackgroundColor: "#4a6fdc",
          pointBorderColor: "#fff",
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.1,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            font: {
              size: 14,
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: 10,
          titleFont: {
            size: 14,
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          },
          bodyFont: {
            size: 13,
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          },
          displayColors: false,
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
          ticks: {
            font: {
              size: 12,
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            },
          },
          title: {
            display: false, // По умолчанию подпись оси X скрыта
            text: "", // Пустое значение по умолчанию
            font: {
              size: 14,
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            },
          },
        },
        y: {
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
          ticks: {
            font: {
              size: 12,
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            },
          },
          title: {
            display: false, // По умолчанию подпись оси Y скрыта
            text: "", // Пустое значение по умолчанию
            font: {
              size: 14,
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            },
          },
        },
      },
      animation: {
        duration: 1000,
        easing: "easeOutQuart",
      },
    },
  });
}

function initializeColorPickers() {
  const colorPickerElements = document.querySelectorAll('.color-picker-container');
  
  colorPickerElements.forEach(pickerContainer => {
    const colorBox = pickerContainer.querySelector('.color-box');
    const colorPicker = pickerContainer.querySelector('.color-picker-popup');
    const hiddenInput = pickerContainer.querySelector('input[type="hidden"]');
    
    // Устанавливаем начальный цвет
    colorBox.style.backgroundColor = hiddenInput.value;
    
    // Создаем палитру цветов
    createColorPalette(colorPicker, hiddenInput, colorBox);
    
    // Обработчик клика по цветовому боксу
    colorBox.addEventListener('click', function(e) {
      e.stopPropagation();
      
      // Закрываем все открытые пикеры
      document.querySelectorAll('.color-picker-popup').forEach(popup => {
        if (popup !== colorPicker) {
          popup.classList.remove('active');
        }
      });
      
      // Открываем/закрываем текущий пикер
      colorPicker.classList.toggle('active');
      
      if (colorPicker.classList.contains('active')) {
        activeColorPicker = colorPicker;
      } else {
        activeColorPicker = null;
      }
    });
  });
  
  // Закрываем пикер при клике вне его
  document.addEventListener('click', function(e) {
    if (activeColorPicker && !e.target.closest('.color-picker-container')) {
      activeColorPicker.classList.remove('active');
      activeColorPicker = null;
    }
  });
}

function createColorPalette(pickerElement, inputElement, colorBoxElement) {
  // Предопределенные цвета
  const presetColors = [
    '#000000', '#444444', '#666666', '#999999', '#cccccc', '#ffffff',
    '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#0000ff',
    '#9900ff', '#ff00ff', '#8b4513', '#a0522d', '#deb887', '#f5f5dc',
    '#708090', '#778899', '#b0c4de', '#4682b4', '#5f9ea0', '#7fffd4'
  ];
  
  // Создаем сетку цветов
  const colorGrid = document.createElement('div');
  colorGrid.className = 'color-grid';
  
  presetColors.forEach(color => {
    const colorCell = document.createElement('div');
    colorCell.className = 'color-cell';
    colorCell.style.backgroundColor = color;
    colorCell.dataset.color = color;
    
    colorCell.addEventListener('click', function(e) {
      e.stopPropagation();
      inputElement.value = color;
      colorBoxElement.style.backgroundColor = color;
      pickerElement.classList.remove('active');
      applyCustomization();
    });
    
    colorGrid.appendChild(colorCell);
  });
  
  // Добавляем кастомный выбор цвета
  const customColorSection = document.createElement('div');
  customColorSection.className = 'custom-color-section';
  
  const customColorInput = document.createElement('input');
  customColorInput.type = 'color';
  customColorInput.value = inputElement.value;
  customColorInput.addEventListener('input', function() {
    inputElement.value = this.value;
    colorBoxElement.style.backgroundColor = this.value;
    applyCustomization();
  });
  
  const customColorLabel = document.createElement('label');
  customColorLabel.textContent = 'Выбрать другой цвет';
  customColorLabel.appendChild(customColorInput);
  
  customColorSection.appendChild(customColorLabel);
  
  // Добавляем элементы в пикер
  pickerElement.appendChild(colorGrid);
  pickerElement.appendChild(customColorSection);
}

function addData() {
  const xValue = document.getElementById("xValue").value;
  const yValue = document.getElementById("yValue").value;
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.innerHTML = "";

  if (xValue && yValue) {
    if (chart.data.labels.includes(xValue)) {
      showError(`Ошибка: значение X = ${xValue} уже существует. Пропускаем.`);
      return;
    }

    chart.data.labels.push(xValue);
    chart.data.datasets[0].data.push(yValue);
    updateTable();
    sortData();
    chart.update();

    // Очистить поля ввода
    document.getElementById("xValue").value = "";
    document.getElementById("yValue").value = "";
    document.getElementById("xValue").focus();
  } else {
    showError("Ошибка: заполните оба поля X и Y.");
  }
}

function addBulkData() {
  const dataInput = document.getElementById("dataInput").value;
  const rows = dataInput.split("\n");
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.innerHTML = "";

  let hasError = false;
  let addedPoints = 0;
  let skippedPoints = 0;

  // Определение разделителя
  let sep = getSeparator();

  rows.forEach((row) => {
    if (row.trim() === "") {
      return;
    }

    const parts = row.split(sep);
    const x = parts[0]?.trim();
    const y = parts[1]?.trim();

    if (x && y && !isNaN(parseFloat(x)) && !isNaN(parseFloat(y))) {
      if (chart.data.labels.includes(x)) {
        showError(
          `Ошибка: значение X = ${x} уже существует. Пропускаем.`,
          true
        );
        hasError = true;
        skippedPoints++;
      } else {
        chart.data.labels.push(x);
        chart.data.datasets[0].data.push(y);
        addedPoints++;
      }
    } else {
      showError(
        `Ошибка: некорректный формат данных в строке "${row}". Используйте формат X${sep}Y.`,
        true
      );
      hasError = true;
    }
  });

  updateTable();
  sortData();
  chart.update();

  // Очистить поле ввода
  document.getElementById("dataInput").value = "";

  // Показать количество добавленных/пропущенных точек
  if (addedPoints > 0) {
    showSuccess(
      `Добавлено точек: ${addedPoints}` +
        (skippedPoints > 0 ? `, пропущено: ${skippedPoints}` : "")
    );
  }
}

function getSeparator() {
  const selectedSeparator = document.querySelector(
    'input[name="separate"]:checked'
  );
  let sep = ","; // Значение по умолчанию

  if (selectedSeparator) {
    switch (selectedSeparator.value) {
      case "tab":
        sep = "\t";
        break;
      case "zap":
        sep = ",";
        break;
      case "space":
        sep = " ";
        break;
    }
  }

  return sep;
}

function updateTable() {
  const tableBody = document.getElementById("dataTable");
  tableBody.innerHTML = "";

  if (chart.data.labels.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `<td colspan="3" style="text-align: center">Нет данных</td>`;
    tableBody.appendChild(emptyRow);
    return;
  }

  chart.data.labels.forEach((label, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${label}</td>
        <td>${chart.data.datasets[0].data[index]}</td>
        <td><button onclick="removeData(${index})">Удалить</button></td>
      `;
    tableBody.appendChild(row);
  });
}
customizationSection = document.getElementById("customization-section"); 

function switchCustom() {
  if (customizationSection.classList.contains('hidden')) {
    customizationSection.classList.remove('hidden');
  } else {
    customizationSection.classList.add('hidden');
  }
}

function removeData(index) {
  chart.data.labels.splice(index, 1);
  chart.data.datasets[0].data.splice(index, 1);
  updateTable();
  chart.update();
}

function clearData() {
  chart.data.labels = [];
  chart.data.datasets[0].data = [];
  updateTable();
  chart.update();
}

function sortData() {
  const combined = chart.data.labels.map((label, index) => {
    return { x: label, y: chart.data.datasets[0].data[index] };
  });

  combined.sort((a, b) => parseFloat(a.x) - parseFloat(b.x));

  chart.data.labels = combined.map((item) => item.x);
  chart.data.datasets[0].data = combined.map((item) => item.y);
}

function downloadChart() {
  const canvas = document.getElementById("chart");

  // Если нет данных на графике
  if (chart.data.labels.length === 0) {
    showError("Нет данных для сохранения графика.");
    return;
  }

  // Создаем временный холст для рисования фона и графика
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext("2d");

  // Заливаем фон выбранным цветом
  const chartBackgroundColor = document.getElementById("chartBackgroundColor").value;
  tempCtx.fillStyle = chartBackgroundColor;
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  // Рисуем график поверх фона
  tempCtx.drawImage(canvas, 0, 0);

  // Создаем временный элемент для скачивания
  const link = document.createElement("a");
  link.href = tempCanvas.toDataURL("image/png");
  link.download = `график_${new Date().toISOString().slice(0, 10)}.png`;
  link.click();

  showSuccess("График успешно сохранен!");
}
function showError(message, append = false) {
  const errorMessage = document.getElementById("errorMessage");
  if (append) {
    errorMessage.innerHTML += message + "<br>";
  } else {
    errorMessage.innerHTML = message;
  }
  errorMessage.style.color = "var(--error-color)";
  errorMessage.classList.remove("hidden");
}

function showSuccess(message) {
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.innerHTML = message;
  errorMessage.style.color = "#2ecc71"; // Зеленый цвет для успешных сообщений
  errorMessage.classList.remove("hidden");
}

// Инициализация таблицы при загрузке
document.addEventListener("DOMContentLoaded", function () {
  updateTable();
});

pointSize = document.getElementById("pointSize");
pointSizeN = document.getElementById("pointSizeN");
nameGraph = document.getElementById("nameGraph");

// xAxisLabel = document.getElementById("nameGraph");
// yAxisLabel = document.getElementById("nameGraph");

// yAxisLabel.addEventListener("input", function () {
//   updateAxisLabels();
// });

// xAxisLabel.addEventListener("input", function () {
//   updateAxisLabels();
// });
nameGraph.addEventListener("input", function () {
  chart.data.datasets[0].label = nameGraph.value;
  chart.update();
});

pointSize.addEventListener("input", function () {
  pointSizeN.innerHTML = pointSize.value;
  chart.data.datasets[0].pointRadius = parseInt(pointSize.value);
  chart.update();
});

lineWidth = document.getElementById("lineWidth");
lineWidthN = document.getElementById("lineWidthN");

lineWidth.addEventListener("input", function () {
  lineWidthN.innerHTML = lineWidth.value;
  chart.data.datasets[0].borderWidth = parseInt(lineWidth.value);
  chart.update();
});

function applyCustomization() {
  const lineColor = document.getElementById("lineColor").value;
  const pointColor = document.getElementById("pointColor").value;
  const backgroundColor = document.getElementById("backgroundColor").value;
  const chartBackgroundColor = document.getElementById("chartBackgroundColor").value;
  const ch = document.getElementById("chart");
  chart.data.datasets[0].borderColor = lineColor;
  chart.data.datasets[0].pointBackgroundColor = pointColor;
  chart.options.scales.x.grid.color = backgroundColor;
  chart.options.scales.y.grid.color = backgroundColor;
  chart.options.backgroundColor = chartBackgroundColor;
  ch.style.backgroundColor = chartBackgroundColor;
  chart.update();
}