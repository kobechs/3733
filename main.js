// やりたいことリストをlocalStorageから読み込む
function loadTodoList() {
    const todoList = JSON.parse(localStorage.getItem("todoList")) || [];
    const todoListElement = document.getElementById("todoList");
    todoListElement.innerHTML = "";

    todoList.forEach(item => {
        const li = createTodoItem(item.text, item.cost, item.priority);
        todoListElement.appendChild(li);
    });

    updateTotalCost();
}

// やりたいことアイテムを作成
function createTodoItem(todoText, todoCost, priority) {
    const li = document.createElement("li");
    li.innerText = `${todoText} - ${formatNumberWithCommas(todoCost)} 円 - 優先度: ${priority}`;

    li.dataset.cost = todoCost;
    li.dataset.priority = priority;

    const years = calculateYearsForGoal(todoCost);
    li.style.color = years <= 10 ? "green" : "red";
    li.innerText += ` (目標年数： ${years} 年) ${years <= 10 ? '✔️' : '❌'}`;

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "削除";
    deleteButton.onclick = function() {
        li.remove();
        saveTodoList();
    };

    li.appendChild(deleteButton);
    return li;
}

// リストをlocalStorageに保存
function saveTodoList() {
    const todoList = [];
    const items = document.getElementById("todoList").getElementsByTagName("li");
    for (const item of items) {
        todoList.push({
            text: item.innerText.split(' - ')[0],
            cost: parseFloat(item.dataset.cost),
            priority: item.dataset.priority
        });
    }
    localStorage.setItem("todoList", JSON.stringify(todoList));
    updateTotalCost();
}

// やりたいことを追加
function addTodo() {
    const todoText = document.getElementById("todoInput").value;
    const todoCost = parseFloat(document.getElementById("todoCost").value);
    let todoPriority = parseInt(document.getElementById("todoPriority").value);

    if (!todoText || !todoCost || !validateTodoCost(todoCost) || isNaN(todoPriority) || todoPriority < 1 || todoPriority > 10) {
        alert("必要な情報を入力してください（優先度は1〜10の数字で入力）。");
        return;
    }

    // 優先度の重複確認
    const existingItems = document.getElementById("todoList").getElementsByTagName("li");
    for (const item of existingItems) {
        const existingPriority = parseInt(item.dataset.priority);
        if (existingPriority === todoPriority) {
            alert(`優先度${todoPriority}はすでに使われています。他の数字を入力してください。`);
            return;
        }
    }

    const todoListElement = document.getElementById("todoList");
    const li = createTodoItem(todoText, todoCost, todoPriority);
    todoListElement.appendChild(li);

    sortTodoList();

    saveTodoList();
    document.getElementById("todoInput").value = '';
    document.getElementById("todoCost").value = '';
    document.getElementById("todoPriority").value = '';
}

// 優先度順に並べ替え
function sortTodoList() {
    const todoListElement = document.getElementById("todoList");
    const items = Array.from(todoListElement.getElementsByTagName("li"));
    items.sort((a, b) => {
        return a.dataset.priority - b.dataset.priority;  // 昇順
    });

    todoListElement.innerHTML = '';
    items.forEach(item => todoListElement.appendChild(item));

    saveTodoList();
}

// 合計金額を更新
function updateTotalCost() {
    const todoList = JSON.parse(localStorage.getItem("todoList")) || [];
    const totalCost = todoList.reduce((acc, item) => acc + item.cost, 0);
    document.getElementById("totalCost").innerText = formatNumberWithCommas(totalCost);
}

// 数字をカンマ区切りにする関数
function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// コストの検証
function validateTodoCost(value) {
    const maxLimit = BigInt("1000000000000"); // 1兆円
    if (isNaN(value) || value <= 0 || BigInt(value) > maxLimit) {
        alert("やりたいことの金額は0より大きく、1兆円以下である必要があります。");
        return false;
    }
    return true;
}

// 数字の追加/減算
function adjustAddition(amount) {
    const todoCostInput = document.getElementById("addition");
    const currentValue = BigInt(todoCostInput.value || 0);
    const newValue = currentValue + BigInt(amount);
    todoCostInput.value = newValue >= 0 ? newValue : 0;
}

// 数字の追加/減算
function adjustTodoCost(amount) {
    const todoCostInput = document.getElementById("todoCost");
    const currentValue = BigInt(todoCostInput.value || 0);
    const newValue = currentValue + BigInt(amount);
    todoCostInput.value = newValue >= 0 ? newValue : 0;
}

// 目標達成までの年数を計算
function calculateYearsForGoal(goalAmount) {
    const addition = BigInt(document.getElementById("addition").value);
    const rate = parseFloat(document.getElementById("rate").value) / 100;

    let amount = BigInt(0);
    for (let i = 1; i <= 10; i++) {
        amount += addition;
        amount += amount * BigInt(Math.round(rate * 100));

        if (amount >= BigInt(goalAmount)) {
            return i;
        }
    }

    return calculateAdditionalYears(goalAmount, addition, rate);
}

// 追加の年数を計算（目標に達成しない場合）
function calculateAdditionalYears(goalAmount, addition, rate) {
    let amount = BigInt(0);
    let years = 0;
    while (amount < goalAmount) {
        amount += addition;
        amount += amount * BigInt(Math.round(rate * 100));
        years++;
    }
    return years;
}

// 貯金シミュレーションの計算
function calcInterest() {
    const button = document.getElementById("calcButton");
    button.disabled = true;
    button.innerText = "計算中...";

    document.getElementById("result").innerHTML = "";
    document.getElementById("goalResult").innerText = "";

    const additionValue = document.getElementById("addition").value;
    const yearsValue = document.getElementById("years").value;

    if (!validateInput(additionValue) || !validateInput(yearsValue)) {
        button.disabled = false;
        button.innerText = "計算";
        return;
    }

    const addition = BigInt(additionValue);
    const rate = parseFloat(document.getElementById("rate").value) / 100;
    const goalInputValue = document.getElementById("goal").value;
    const goal = goalInputValue && goalInputValue > 0 ? parseFloat(goalInputValue) : Infinity;
    const years = parseInt(yearsValue);

    let amount = BigInt(0);
    let yearsToReachGoal = 0;

    setTimeout(() => {
        for (let i = 1; i <= years; i++) {
            amount += addition;
            amount += amount * BigInt(Math.round(rate * 100));

            const tr = document.createElement("tr");
            const th = document.createElement("th");
            th.innerHTML = i;
            tr.appendChild(th);

            const td = document.createElement("td");
            td.innerHTML = formatNumberWithCommas(amount.toString());
            tr.appendChild(td);

            document.getElementById("result").appendChild(tr);

            if (goal !== Infinity && amount >= BigInt(goal)) {
                yearsToReachGoal = i;
                break;
            }
        }

        if (goal !== Infinity) {
            if (yearsToReachGoal > 0) {
                document.getElementById("goalResult").innerText = `目標額 ${goal} 円を ${yearsToReachGoal} 年で達成します。`;
            } else {
                document.getElementById("goalResult").innerText = `目標額 ${goal} 円に ${years} 年以内には達成できませんでした。`;
            }
        }

        button.disabled = false;
        button.innerText = "計算";
    }, 1500);
}

// 入力値の検証
function validateInput(value) {
    const maxLimit = BigInt("1000000000000"); // 1兆円
    if (isNaN(value) || value < 0 || BigInt(value) > maxLimit) {
        alert("有効な金額を入力してください（0～1兆円）。");
        return false;
    }
    return true;
}

document.addEventListener("DOMContentLoaded", function() {
    loadTodoList();

    document.getElementById("addButton").addEventListener("click", addTodo);
    document.getElementById("calcButton").addEventListener("click", calcInterest);
    document.getElementById("additionPlus").addEventListener("click", function() { adjustTodoCost(10000); });
    document.getElementById("additionMinus").addEventListener("click", function() { adjustTodoCost(-10000); });
});
