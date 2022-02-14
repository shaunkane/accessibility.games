/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

// Screen Racers.js
//
// This script covers issues related to user profiles and the UI

// first, user profiles
// set defaults
const voiceSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3];

function initializeUserSettings() {
    window.voiceOn = checkOrSetLocalStorage("voiceOn", true) === 'true';
    window.speechRate = Number(checkOrSetLocalStorage("speechRate", 1.25));
}

// check for localstorage value. if it doesn't exist, set a default
function checkOrSetLocalStorage(key, value) {
    console.log(`${key}: ${localStorage[key]}`)
    if (localStorage[key] == null) localStorage[key] = value;
    return localStorage[key];
}

// save back to local storage
function saveUserSettings() {
    localStorage["voiceOn"] = window.voiceOn;
    localStorage["speechRate"] = window.speechRate;
}

// whenever we load or change user settings, update the UI state
function updateUI() {
    const btnVoice = document.getElementById('btnVoice');
    if (window.voiceOn) {
        btnVoice.classList.remove('strikeout');
        btnVoice.innerText = "Speech On";
    } else {
        btnVoice.classList.add('strikeout');
        btnVoice.innerText = "Speech Off";
    }
    document.getElementById('playSpeed').innerText = speechRate;
}

// these UI elements adjust our user settings
// toggle speech
document.getElementById('btnVoice').addEventListener("click", (e) => {
    window.voiceOn = !window.voiceOn;
    saveUserSettings();
    updateUI();
});


document.getElementById('btnSpeedUp').addEventListener("click", (e) => {
    const currentSpeed = voiceSpeeds.indexOf(speechRate);
    const newIndex = Math.min(currentSpeed + 1, voiceSpeeds.length - 1);
    window.speechRate = voiceSpeeds[newIndex];
    saveUserSettings();
    updateUI();
});

document.getElementById('btnSpeedDown').addEventListener("click", (e) => {
    const currentSpeed = voiceSpeeds.indexOf(speechRate);
    const newIndex = Math.max(currentSpeed - 1, 0);
    window.speechRate = voiceSpeeds[newIndex];
    saveUserSettings();
    updateUI();
});

// UI functions
// if we don't pass visible, just toggle
function setModalVisible(visible = null) {
    if (visible) document.querySelector('.modalFrame').classList.remove("hidden");
    else if (!visible) document.querySelector('.modalFrame').classList.add("hidden");
    else {
        if (document.querySelector('.modalFrame').classList.contains("hidden")) {
            document.querySelector('.modalFrame').classList.remove("hidden");
        } else {
            document.querySelector('.modalFrame').classList.add("hidden");
        }
    }
}

function setScreenReaderVisible(visible = null) {
    if (visible) document.querySelector('.screenReaderFrame').classList.remove("hidden");
    else if (!visible) document.querySelector('.screenReaderFrame').classList.add("hidden");
    else {
        if (document.querySelector('.screenReaderFrame').classList.contains("hidden")) {
            document.querySelector('.screenReaderFrame').classList.remove("hidden");
        } else {
            document.querySelector('.screenReaderFrame').classList.add("hidden");

        }
    }
}

// display text in the screen reader display. pass either "input" or "output"
// to choose where this shows up on the display
function displayScreenReaderFeedback(text, destination) {
    const elementID = destination == "input" ? "inputNotification" : "outputNotification";
    document.getElementById(elementID).innerText = text;
}

// DOCUMENT ONLOAD
// call initializeUserSettings and updateUI at the start of every page
document.addEventListener('DOMContentLoaded', function(event) {
    initializeUserSettings();
    updateUI();
});