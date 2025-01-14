let timer;
let timeLeft = 600; // 10分（600秒）
let startTime; // 解答開始時刻
let isTimeUp = false; // 時間が終了したかどうかを管理するフラグ

// タイマーの開始
function startTimer() {
  timer = setInterval(() => {
    if (isTimeUp) return; // タイマーが終了した場合は処理しない

    timeLeft--;
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    document.getElementById(
      "timerContainer"
    ).textContent = `残り時間: ${minutes}分${seconds}秒`;

    if (timeLeft <= 0) {
      clearInterval(timer); // タイマーを停止
      isTimeUp = true; // 時間終了フラグを立てる
      submitAnswers(); // 時間が来たら自動的に解答結果を送信
    }
  }, 1000);
}

// 問題を生成する関数
function generateRandomQuestion() {
  let questions = [];

  // 10問ランダムに生成
  for (let i = 0; i < 10; i++) {
    let num = Math.floor(Math.random() * 90) + 10; // 2桁以上のランダムな数字（10〜99）
    let question = {};
    let questionType = Math.floor(Math.random() * 4); // 0: 10進数→2進数, 1: 2進数→10進数, 2: 10進数→16進数, 3: 16進数→10進数

    // 問題のタイプを決定
    if (questionType === 0) {
      question.type = "decimal-to-binary";
      question.number = num;
      question.answer = num.toString(2);
      question.explanation = getDecimalToBinaryExplanation(num); // 途中式を追加
    } else if (questionType === 1) {
      question.type = "binary-to-decimal";
      question.number = num.toString(2);
      question.answer = parseInt(question.number, 2).toString();
      question.explanation = getBinaryToDecimalExplanation(question.number); // 途中式を追加
    } else if (questionType === 2) {
      question.type = "decimal-to-hexadecimal";
      question.number = num;
      question.answer = num.toString(16).toUpperCase();
      question.explanation = getDecimalToHexadecimalExplanation(num); // 途中式を追加
    } else {
      question.type = "hexadecimal-to-decimal";
      question.number = num.toString(16).toUpperCase();
      question.answer = parseInt(question.number, 16).toString();
      question.explanation = getHexadecimalToDecimalExplanation(
        question.number
      ); // 途中式を追加
    }

    // 選択肢を生成
    let options = generateOptions(question.answer);
    question.options = options;
    questions.push(question);
  }

  return questions;
}

// 10進数→2進数の解説と途中式
function getDecimalToBinaryExplanation(number) {
  let explanation = `${number} を2進数に変換するには、2で割っていき、余りを逆順に並べます。\n途中式:\n`;
  let steps = [];
  let quotient = number;
  while (quotient > 0) {
    steps.push(
      `${quotient} ÷ 2 = ${Math.floor(quotient / 2)} 余り ${quotient % 2}`
    );
    quotient = Math.floor(quotient / 2);
  }
  explanation += steps.reverse().join("\n");
  return explanation;
}

// 2進数→10進数の解説と途中式
function getBinaryToDecimalExplanation(binary) {
  let explanation = `${binary} を10進数に変換するには、各桁を2の冪乗で計算します。\n途中式:\n`;
  let steps = [];
  let length = binary.length;
  for (let i = 0; i < length; i++) {
    let bit = binary[i];
    steps.push(`${bit} × 2^${length - i - 1}`);
  }
  explanation += steps.join(" + ") + `\n結果: ${parseInt(binary, 2)}`;
  return explanation;
}

// 10進数→16進数の解説と途中式
function getDecimalToHexadecimalExplanation(number) {
  let explanation = `${number} を16進数に変換するには、16で割り、余りを逆順に並べます。\n途中式:\n`;
  let steps = [];
  let quotient = number;
  while (quotient > 0) {
    let remainder = quotient % 16;
    steps.push(
      `${quotient} ÷ 16 = ${Math.floor(quotient / 16)} 余り ${remainder}`
    );
    quotient = Math.floor(quotient / 16);
  }
  explanation += steps.reverse().join("\n");
  return explanation;
}

// 16進数→10進数の解説と途中式
function getHexadecimalToDecimalExplanation(hex) {
  let explanation = `${hex} を10進数に変換するには、各桁を16の冪乗で計算します。\n途中式:\n`;
  let steps = [];
  let length = hex.length;
  let hexDigits = "0123456789ABCDEF";
  for (let i = 0; i < length; i++) {
    let digit = hex[i];
    let digitValue = hexDigits.indexOf(digit);
    steps.push(`${digitValue} × 16^${length - i - 1}`);
  }
  explanation += steps.join(" + ") + `\n結果: ${parseInt(hex, 16)}`;
  return explanation;
}

// 選択肢を生成する関数
function generateOptions(correctAnswer) {
  let options = [correctAnswer];
  while (options.length < 3) {
    let randomOption = generateRandomAnswer(correctAnswer);
    if (!options.includes(randomOption)) {
      options.push(randomOption);
    }
  }
  options = options.sort(() => Math.random() - 0.5); // 選択肢をランダムに並べる
  return options;
}

// ランダムな間違いの選択肢を生成
function generateRandomAnswer(correctAnswer) {
  let randomValue = Math.floor(Math.random() * 100) + 1;
  return randomValue.toString(2);
}

// クイズをHTMLに表示する関数
function displayQuiz() {
  let questions = generateRandomQuestion();
  window.questions = questions; // 問題をグローバルで保持
  let quizContainer = document.getElementById("quizContainer");
  quizContainer.innerHTML = "";

  questions.forEach((question, index) => {
    let questionDiv = document.createElement("div");
    questionDiv.classList.add("question");
    questionDiv.id = `question-${index}`;

    let questionText = document.createElement("p");
    questionText.textContent = `Q${index + 1}: ${
      question.number
    } の ${getQuestionText(question.type)} は？`;
    questionDiv.appendChild(questionText);

    let explanationText = document.createElement("p");
    explanationText.textContent = `解説: ${question.explanation}`;
    explanationText.classList.add("explanation");
    explanationText.style.display = "none"; // 初期状態では非表示
    questionDiv.appendChild(explanationText);

    question.options.forEach((option, i) => {
      let button = document.createElement("button");
      button.textContent = option;
      button.classList.add("option-btn");
      button.onclick = () => selectOption(index, option, button);
      questionDiv.appendChild(button);
    });

    quizContainer.appendChild(questionDiv);
  });

  let submitButton = document.createElement("button");
  submitButton.textContent = "解答する";
  submitButton.classList.add("submit-btn");
  submitButton.style.display = "none";
  submitButton.onclick = () => {
    submitAnswers();
    submitButton.disabled = true; // 解答するボタンを無効にする
  };
  quizContainer.appendChild(submitButton);

  startTimer();
  startTime = Date.now();
}

// 問題タイプのテキストを取得
function getQuestionText(type) {
  if (type === "decimal-to-binary") return "10進数→2進数";
  if (type === "binary-to-decimal") return "2進数→10進数";
  if (type === "decimal-to-hexadecimal") return "10進数→16進数";
  if (type === "hexadecimal-to-decimal") return "16進数→10進数";
  return "";
}

// 解答結果を表示
let selectedAnswers = [];
function submitAnswers() {
  let quizContainer = document.getElementById("quizContainer");
  let resultContainer = document.getElementById("resultContainer");
  let questions = window.questions;
  let correctAnswers = 0;

  resultContainer.innerHTML = "";

  let elapsedTime = (Date.now() - startTime) / 1000;
  let minutes = Math.floor(elapsedTime / 60);
  let seconds = Math.floor(elapsedTime % 60);

  questions.forEach((question, index) => {
    let questionDiv = document.getElementById(`question-${index}`);

    // 正誤判定の表示
    let resultText = document.createElement("p");
    if (selectedAnswers[index]) {
      let selectedOption = selectedAnswers[index];
      if (selectedOption === question.answer) {
        correctAnswers++;
        resultText.textContent = `Q${index + 1}: 正解！`;
        questionDiv.style.backgroundColor = "#d3ffd3"; // 正解の背景色
      } else {
        resultText.textContent = `Q${index + 1}: 不正解。正解は ${
          question.answer
        } です。`;
        questionDiv.style.backgroundColor = "#ffcccc"; // 不正解の背景色
      }
    } else {
      resultText.textContent = `Q${index + 1}: 未回答`;
      questionDiv.style.backgroundColor = "#fff0f0"; // 未回答の背景色
    }

    // 正誤判定を解説の上に配置
    questionDiv.appendChild(resultText);

    // 解説を表示（正誤判定の下に表示）
    let explanationText = document.createElement("p");
    explanationText.textContent = `解説: ${question.explanation}`;
    explanationText.classList.add("explanation");
    explanationText.style.display = "block";
    questionDiv.appendChild(explanationText);
  });

  // 最終結果の表示
  let finalResultText = document.createElement("p");
  finalResultText.textContent = `正解数: ${correctAnswers} / 10`;
  let timeText = document.createElement("p");
  timeText.textContent = `経過時間: ${minutes}分${seconds}秒`;
  resultContainer.appendChild(finalResultText);
  resultContainer.appendChild(timeText);

  // 解答後にタイマーを非表示にする
  document.getElementById("timerContainer").style.display = "none";

  // 「STAGE SELECTへ戻る」ボタンを右下に表示
  let backButton = document.createElement("button");
  backButton.textContent = "STAGE SELECTへ戻る";
  backButton.classList.add("back-btn");
  backButton.onclick = () => {
    window.location.href = "select2.html"; // ここで遷移先のURLを指定
  };
  // ボタンを画面右下に固定
  backButton.style.position = "fixed";
  backButton.style.bottom = "20px";
  backButton.style.right = "20px";
  backButton.style.padding = "10px 20px";
  backButton.style.backgroundColor = "#4CAF50";
  backButton.style.color = "white";
  backButton.style.border = "none";
  backButton.style.borderRadius = "5px";
  backButton.style.cursor = "pointer";
  document.body.appendChild(backButton);
}

// 選択肢を選んだときの処理
function selectOption(questionIndex, selectedOption, button) {
  selectedAnswers[questionIndex] = selectedOption;
  let buttons = document.querySelectorAll(`#question-${questionIndex} button`);
  buttons.forEach((btn) => btn.classList.remove("selectedOption"));
  button.classList.add("selectedOption");

  let submitButton = document.querySelector(".submit-btn");
  submitButton.style.display = "block"; // 解答ボタンを表示
}

// 初期化
document.addEventListener("DOMContentLoaded", () => {
  displayQuiz();
});
