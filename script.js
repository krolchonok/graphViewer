document.addEventListener("DOMContentLoaded", function () {
  initializeChart();
});

let chart;

function initializeChart() {
  const ctx = document.getElementById("chart").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Линейный график",
          data: [],
          borderColor: "rgba(192, 192, 192)",
          backgroundColor: "rgba(40, 40, 255, 0.1)",
          borderWidth: 3,
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
        },
      },
      animation: {
        duration: 1000,
        easing: "easeOutQuart",
      },
    },
  });
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

function removeData(index) {
  chart.data.labels.splice(index, 1);
  chart.data.datasets[0].data.splice(index, 1);
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

  // Создаем временный элемент для скачивания
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
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
}

function showSuccess(message) {
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.innerHTML = message;
  errorMessage.style.color = "#2ecc71"; // Зеленый цвет для успешных сообщений
}

// Инициализация таблицы при загрузке
document.addEventListener("DOMContentLoaded", function () {
  updateTable();
});

function applyCustomization() {
  const lineColor = document.getElementById("lineColor").value;
  const pointColor = document.getElementById("pointColor").value;
  const backgroundColor = document.getElementById("backgroundColor").value;

  chart.data.datasets[0].borderColor = lineColor;
  chart.data.datasets[0].pointBackgroundColor = pointColor;
  chart.options.scales.x.grid.color = backgroundColor;
  chart.options.scales.y.grid.color = backgroundColor;
  chart.update();
}

