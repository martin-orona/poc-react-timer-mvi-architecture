import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";

let model = {
  isRunning: false,
  remainingSeconds: 5,
  intendedMinutes: "",
  intendedSeconds: ""
};

const Intents = {
  tick: "tick",
  start: "start",
  stop: "stop",
  reset: "reset",
  updateMinutes: "updateMinutes",
  updateSeconds: "updateSeconds"
};

const update = (model, intent) => {
  let tickIntervalId;
  const actions = defineActions();
  actions[intent]();

  function defineActions() {
    var actions = {};
    actions[Intents.tick] = tick;
    actions[Intents.start] = start;
    actions[Intents.stop] = stop;
    actions[Intents.reset] = reset;
    actions[Intents.updateMinutes] = updateMinutes;
    actions[Intents.updateSeconds] = updateSeconds;
    return actions;
  }

  function tick() {
    if (!model.isRunning) {
      return;
    }

    if (model.remainingSeconds <= 0) {
      stop();
      reset();
      return;
    }

    model.remainingSeconds -= 1;
  }

  function start() {
    if (model.remainingSeconds <= 0) {
      return;
    }

    model.isRunning = true;

    tickIntervalId = setInterval(() => {
      if (!model.isRunning) {
        clearInterval(tickIntervalId);
      }
      update(model, Intents.tick);
      renderUI();
    }, 1000);
  }

  function stop() {
    model.isRunning = false;
  }

  function reset() {
    model.isRunning = false;
    model.remainingSeconds = 0;
  }

  function updateMinutes() {
    var parsed = parseInt(model.intendedMinutes);
    if (isNaN(parsed)) {
      return;
    }

    var time = splitTime(model.remainingSeconds);
    time.minutes = parsed;
    model.remainingSeconds = joinTime(time);
    renderUI();
  }

  function updateSeconds() {
    var parsed = parseInt(model.intendedSeconds);
    if (isNaN(parsed)) {
      return;
    }

    var time = splitTime(model.remainingSeconds);
    time.seconds = parsed;
    model.remainingSeconds = joinTime(time);
    renderUI();
  }
};

const splitTime = secs => {
  let minutes = Math.floor(secs / 60);
  let seconds = secs - minutes * 60;

  return { minutes: minutes, seconds: seconds };
};

const joinTime = time => time.minutes * 60 + time.seconds;

const view = model => {
  let time = splitTime(model.remainingSeconds);

  const format = value => `${value < 10 ? "0" : ""}${value}`;

  let displayValue = `${format(time.minutes)}:${format(time.seconds)}`;

  const onAction = (event, action) => {
    update(model, action);
    renderUI();
  };

  const onChangeMinutes = event => {
    event.preventDefault();
    model.intendedMinutes = event.target.value;
    update(model, Intents.updateMinutes);
  };

  const onChangeSeconds = event => {
    event.preventDefault();
    model.intendedSeconds = event.target.value;
    update(model, Intents.updateSeconds);
  };

  const renderTime = () => {
    return (
      <div>
        {model.isRunning ? (
          <label>{displayValue}</label>
        ) : (
          <div className="timer-settable-value">
            <input
              type="text"
              value={format(time.minutes)}
              onChange={onChangeMinutes}
            />
            :
            <input
              type="text"
              value={format(time.seconds)}
              onChange={onChangeSeconds}
            />
          </div>
        )}
      </div>
    );
  };

  const renderActions = () => {
    var mainAction;
    if (!model.isRunning) {
      mainAction = (
        <button
          onClick={event => onAction(event, Intents.start)}
          disabled={model.remainingSeconds <= 0}
        >
          Start
        </button>
      );
    } else {
      mainAction = (
        <button
          onClick={event => onAction(event, Intents.stop)}
          display={!model.isRunning ? "none" : ""}
        >
          Stop
        </button>
      );
    }
    return (
      <div className="actions">
        {mainAction}
        <button onClick={event => onAction(event, Intents.reset)}>Reset</button>
      </div>
    );
  };

  return (
    <div>
      <h2>React MVI Architecture Timer</h2>
      {renderTime()}
      {renderActions()}
    </div>
  );
};

const renderUI = () => {
  ReactDOM.render(view(model), document.getElementById("root"));
};

renderUI();

// setInterval(() => {
//   update(model, Intents.tick);
//   renderUI();
// }, 1000);
