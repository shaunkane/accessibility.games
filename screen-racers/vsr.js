/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
// the virtual screen reader
// this reads out words, highlighting each ones
// it also allows for keyboard control similar to
// a real screen reader

// load this up and attach to a page element.
// this acts more or less like the NVDA screen
// reader. you can use the arrow keys to navigate
// through each item, H to navigate between headers,
// K to navigate through links
class VirtualScreenReader {
    constructor(element) {
        this.element = element;

        // when we load the VSR, we will build a model of
        // the selected element. we will store these in a list
        this.readableElements = element.querySelectorAll('p,h1,h2,h3');

        // split into words
        this.readableElements.forEach(element => {
            splitWords(element);
        });

        // currently we just navigate the parsed phrases and ignore the rest of the DOM
        this.phrases = element.querySelectorAll(".phrase");
        this.currentPhraseIndex = -1;
    }

    readPreviousElement(tag = null) {
        // if we're speaking, stop. then wait a moment before
        // continuing. speaking immediately after canceling
        // seems to cause problems
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setTimeout(() => {
                this.readPreviousElement(tag);
            }, 250);
            return;
        }
        if (tag != null) {
            // get the elements BEFORE this one
            var reverseList = Array.from(this.phrases).slice().reverse();
            var restOfList = reverseList.slice(this.phrases.length - this.currentPhraseIndex).filter(el => el.dataset.type == tag);
            if (restOfList.length == 0) {
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(`No more ${tag} tags`));
            } else {
                // index back into the original list, not the reversed list
                this.currentPhraseIndex = Array.from(this.phrases).indexOf(restOfList[0]);
                this.wordIndex = -1;
                this.wordElements = this.phrases[this.currentPhraseIndex].children; // these are the "word" spans
                this.readText(this.phrases[this.currentPhraseIndex].innerText);
            }
        } else {
            this.currentPhraseIndex = Math.max(this.currentPhraseIndex - 1, 0);
            this.wordIndex = -1;
            this.wordElements = this.phrases[this.currentPhraseIndex].children; // these are the "word" spans
            this.readText(this.phrases[this.currentPhraseIndex].innerText);
        }
    }
    readNextElement(tag = null) {
        // if we're speaking, stop. then wait a moment before
        // continuing. speaking immediately after canceling
        // seems to cause problems
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setTimeout(() => {
                this.readNextElement(tag);
            }, 250);
            return;
        }
        // if we've specified a tag, check to see if this matches. if it doesn't, lookahead to see
        // if there's a matching one. if not, exit
        if (tag != null) {
            // get the elements after this one
            var restOfList = Array.from(this.phrases).slice(this.currentPhraseIndex + 1).filter(el => el.dataset.type == tag);
            if (restOfList.length == 0) {
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(`No more ${tag} tags`));
            } else {
                this.currentPhraseIndex = Array.from(this.phrases).indexOf(restOfList[0]);
                this.wordIndex = -1;
                this.wordElements = this.phrases[this.currentPhraseIndex].children; // these are the "word" spans
                this.readText(this.phrases[this.currentPhraseIndex].innerText);
            }
        } else {
            this.currentPhraseIndex = Math.min(this.currentPhraseIndex + 1, this.phrases.length - 1);
            this.wordIndex = -1;
            this.wordElements = this.phrases[this.currentPhraseIndex].children; // these are the "word" spans
            this.readText(this.phrases[this.currentPhraseIndex].innerText);
        }
    }


    readText(text) {
        const utt = new SpeechSynthesisUtterance(text);
        utt.addEventListener('boundary', event => {
            // we have to filter these because the onboundary event doesn't fire once per word, and fires extra for
            // punctuation and numbers. we look at the substring between the last event and the current. 
            // if there's no space between them, we ignore the event
            var isValidEvent = true;
            if (event.charIndex > 0) { // if this is the first word, we know it's not true
                const substring = text.substr(this.previousCharIndex, event.charIndex - this.previousCharIndex + 1);
                isValidEvent = substring.indexOf(' ') != -1;
            }
            if (isValidEvent) {
                vsr.previousCharIndex = event.charIndex;
                if (vsr.highlighted) { // clear old highlight
                    vsr.highlighted.classList.remove("highlight");
                }
                vsr.wordIndex++; // check out the next word

                // we have two CSS classes, visited and highlighted.
                // highlighted is the current word
                // we keep track of visited words for our "hidden" mode, where
                // words start out invisible and appear as they are read
                vsr.wordElements[vsr.wordIndex].classList.add("highlight");
                vsr.highlighted = vsr.wordElements[vsr.wordIndex];

                // show what's being spoken
                displayScreenReaderFeedback(vsr.wordElements[vsr.wordIndex].innerText, "output");
            } else {

            }
        });
        utt.rate = speechRate;
        if (!window.voiceOn) utt.volume = 0.001;
        window.speechSynthesis.speak(utt);
    }
}

// take our HTML documents and break up elements like p, h1, etc
// into a series of spans representing words and phrases
function splitWords(element) {
    element.childNodes.forEach(child => {
        if (child.nodeType == Node.ELEMENT_NODE) {
            splitWords(child);
        } else {
            const words = child.textContent.trim().split(' ');
            const span = createElement('span', 'phrase', '');
            span.dataset.type = element.tagName;
            words.forEach(word => {
                if (word.trim() != '' && word.trim() != ',') {
                    const wordWrapper = createElement('span', 'word', word);
                    span.appendChild(wordWrapper);
                    span.appendChild(document.createTextNode(' '));
                }
            });
            element.insertBefore(span, child);
            element.removeChild(child);
        }
    });
}

function createElement(tagName, className, text) {
    const tag = document.createElement(tagName);
    tag.className = className;
    tag.innerHTML = text;
    return tag;
}