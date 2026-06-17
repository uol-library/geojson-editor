/**************************************
 * Overlays
 *************************************/

/**
 * @description Set focus on descendant nodes until the first focusable element is found.
 * @param {element} DOM node for which to find the first focusable descendant.
 * @returns {boolean} true if a focusable element is found and focus is set.
 */
function focusFirstDescendant(element) {
    for (var i = 0; i < element.childNodes.length; i++) {
        var child = element.childNodes[i];
        if ( attemptFocus(child) || focusFirstDescendant(child) ) {
            return true;
        }
    }
    return false;
};

/**
 * @description Set Attempt to set focus on the current node.
 * @param {element} The element to attempt to focus on.
 * @returns {boolean} true if element is focused.
 */
function attemptFocus(element) {
    if ( !isFocusable(element)) {
        return false;
    }
    try {
        element.focus();
    } catch (e) {
        // continue regardless of error
    }
    return document.activeElement === element;
};

/**
 * @description Determine if an element is focusable.
 * @param {element} The element to check.
 * @returns {boolean} true if element is focusable.
 */
function isFocusable(element) {
    if (element.tabIndex < 0) {
        return false;
    }
    if (element.disabled) {
        return false;
    }
    switch (element.nodeName) {
        case 'A':
            return !!element.href && element.rel != 'ignore';
        case 'INPUT':
            return element.type != 'hidden';
        case 'BUTTON':
        case 'SELECT':
        case 'TEXTAREA':
            return true;
        default:
            return false;
    }
};

document.addEventListener('keyup', (event) => {
    var key = event.which || event.keyCode;
    if (key === 27 && window.closeOverlay()) {
        event.stopPropagation();
    }
});

/**
 * @class
 * @description Overlay object providing modal focus management.
 *
 * Assumptions: The element serving as the overlay container is present in the
 * DOM and hidden. The overlay container has role='dialog'.
 */
class Overlay {
    /**
     * @description
     *  Shows the overlay and adds event listeners to trap focus within the dialog.
     *  Also adds a class to the body element to disable scrolling.
     *  When the dialog is closed, the focus is set to the element specified by
     *  focusAfterClosed and the class disabling scrolling is removed from the body.
     * @param overlayId
     *          The ID of the element serving as the overlay container.
     * @param focusAfterClosed
     *          Either the DOM node or the ID of the DOM node to focus when the
     *          dialog closes.
     * @param focusFirst
     *          Optional parameter containing either the DOM node or the ID of the
     *          DOM node to focus when the dialog opens. If not specified, the
     *          first focusable element in the dialog will receive focus.
     */
    constructor(overlayId, focusAfterClosed, focusFirst) {
        this.overlayNode = document.getElementById(overlayId);
        if (this.overlayNode === null) {
            throw new Error('No element found with id="' + overlayId + '".');
        }
        var validRoles = [, 'alertdialog'];
        var isDialog = (this.overlayNode.getAttribute('role') || '')
            .trim()
            .split(/\s+/g)
            .some(function (token) {
                return token === 'dialog';
            }
        );
        if (!isDialog) {
            throw new Error(
                'Overlay() requires a DOM element with ARIA role of dialog.'
            );
        }
        if (typeof focusAfterClosed === 'string') {
            this.focusAfterClosed = document.getElementById(focusAfterClosed);
        } else if (typeof focusAfterClosed === 'object') {
            this.focusAfterClosed = focusAfterClosed;
        } else {
            throw new Error(
                'the focusAfterClosed parameter is required for the aria.Dialog constructor.'
            );
        }

        if (typeof focusFirst === 'string') {
            this.focusFirst = document.getElementById(focusFirst);
        } else if (typeof focusFirst === 'object') {
            this.focusFirst = focusFirst;
        } else {
            this.focusFirst = null;
        }
    }

    function open(content) {
        this.overlayNode.appendChild(content);

        // Disable scroll on the body element
        document.body.classList.add('no-scroll');


    // Bracket the dialog node with two invisible, focusable nodes.
    // While this dialog is open, we use these to make sure that focus never
    // leaves the document even if overlayNode is the first or last node.
    var preDiv = document.createElement('div');
    this.preNode = this.overlayNode.parentNode.insertBefore(
      preDiv,
      this.overlayNode
    );
    this.preNode.tabIndex = 0;
    var postDiv = document.createElement('div');
    this.postNode = this.overlayNode.parentNode.insertBefore(
      postDiv,
      this.overlayNode.nextSibling
    );
    this.postNode.tabIndex = 0;

    // If this modal is opening on top of one that is already open,
    // get rid of the document focus listener of the open dialog.
    if (aria.OpenDialogList.length > 0) {
      aria.getCurrentDialog().removeListeners();
    }

    this.addListeners();
    aria.OpenDialogList.push(this);
    this.clearDialog();
    this.overlayNode.className = 'default_dialog'; // make visible

    if (this.focusFirst) {
      this.focusFirst.focus();
    } else {
      aria.Utils.focusFirstDescendant(this.overlayNode);
    }

    this.lastFocus = document.activeElement;
  }; // end Dialog constructor

  aria.Dialog.prototype.clearDialog = function () {
    Array.prototype.map.call(
      this.overlayNode.querySelectorAll('input'),
      function (input) {
        input.value = '';
      }
    );
  };

  /**
   * @description
   *  Hides the current top dialog,
   *  removes listeners of the top dialog,
   *  restore listeners of a parent dialog if one was open under the one that just closed,
   *  and sets focus on the element specified for focusAfterClosed.
   */
  aria.Dialog.prototype.close = function () {
    aria.OpenDialogList.pop();
    this.removeListeners();
    aria.Utils.remove(this.preNode);
    aria.Utils.remove(this.postNode);
    this.overlayNode.className = 'hidden';
    this.backdropNode.classList.remove('active');
    this.focusAfterClosed.focus();

    // If a dialog was open underneath this one, restore its listeners.
    if (aria.OpenDialogList.length > 0) {
      aria.getCurrentDialog().addListeners();
    } else {
      document.body.classList.remove(aria.Utils.dialogOpenClass);
    }
  }; // end close

  /**
   * @description
   *  Hides the current dialog and replaces it with another.
   * @param newDialogId
   *  ID of the dialog that will replace the currently open top dialog.
   * @param newFocusAfterClosed
   *  Optional ID or DOM node specifying where to place focus when the new dialog closes.
   *  If not specified, focus will be placed on the element specified by the dialog being replaced.
   * @param newFocusFirst
   *  Optional ID or DOM node specifying where to place focus in the new dialog when it opens.
   *  If not specified, the first focusable element will receive focus.
   */
  aria.Dialog.prototype.replace = function (
    newDialogId,
    newFocusAfterClosed,
    newFocusFirst
  ) {
    aria.OpenDialogList.pop();
    this.removeListeners();
    aria.Utils.remove(this.preNode);
    aria.Utils.remove(this.postNode);
    this.overlayNode.className = 'hidden';
    this.backdropNode.classList.remove('active');

    var focusAfterClosed = newFocusAfterClosed || this.focusAfterClosed;
    new aria.Dialog(newDialogId, focusAfterClosed, newFocusFirst);
  }; // end replace

  aria.Dialog.prototype.addListeners = function () {
    document.addEventListener('focus', this.trapFocus, true);
  }; // end addListeners

  aria.Dialog.prototype.removeListeners = function () {
    document.removeEventListener('focus', this.trapFocus, true);
  }; // end removeListeners

  aria.Dialog.prototype.trapFocus = function (event) {
    if (aria.Utils.IgnoreUtilFocusChanges) {
      return;
    }
    var currentDialog = aria.getCurrentDialog();
    if (currentDialog.overlayNode.contains(event.target)) {
      currentDialog.lastFocus = event.target;
    } else {
      aria.Utils.focusFirstDescendant(currentDialog.overlayNode);
      if (currentDialog.lastFocus == document.activeElement) {
        aria.Utils.focusLastDescendant(currentDialog.overlayNode);
      }
      currentDialog.lastFocus = document.activeElement;
    }
  }; // end trapFocus

window.openOverlay = function (overlayId, focusAfterClosed, focusFirst) {
    new Overlay(overlayId, focusAfterClosed, focusFirst);
};

  window.closeDialog = function (closeButton) {
    var topDialog = aria.getCurrentDialog();
    if (topDialog.overlayNode.contains(closeButton)) {
      topDialog.close();
    }
  }; // end closeDialog

  window.replaceDialog = function (
    newDialogId,
    newFocusAfterClosed,
    newFocusFirst
  ) {
    var topDialog = aria.getCurrentDialog();
    if (topDialog.overlayNode.contains(document.activeElement)) {
      topDialog.replace(newDialogId, newFocusAfterClosed, newFocusFirst);
    }
  }; // end replaceDialog
})();
'use strict';
/**
 * @namespace aria
 */

var aria = aria || {};

/**
 * @description
 *  Key code constants
 */
aria.KeyCode = {
  BACKSPACE: 8,
  TAB: 9,
  RETURN: 13,
  SHIFT: 16,
  ESC: 27,
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  DELETE: 46,
};

aria.Utils = aria.Utils || {};

// Polyfill src https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
aria.Utils.matches = function (element, selector) {
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.matchesSelector ||
      Element.prototype.mozMatchesSelector ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.oMatchesSelector ||
      Element.prototype.webkitMatchesSelector ||
      function (s) {
        var matches = element.parentNode.querySelectorAll(s);
        var i = matches.length;
        while (--i >= 0 && matches.item(i) !== this) {
          // empty
        }
        return i > -1;
      };
  }

  return element.matches(selector);
};

aria.Utils.remove = function (item) {
  if (item.remove && typeof item.remove === 'function') {
    return item.remove();
  }
  if (
    item.parentNode &&
    item.parentNode.removeChild &&
    typeof item.parentNode.removeChild === 'function'
  ) {
    return item.parentNode.removeChild(item);
  }
  return false;
};

aria.Utils.

aria.Utils.getAncestorBySelector = function (element, selector) {
  if (!aria.Utils.matches(element, selector + ' ' + element.tagName)) {
    // Element is not inside an element that matches selector
    return null;
  }

  // Move up the DOM tree until a parent matching the selector is found
  var currentNode = element;
  var ancestor = null;
  while (ancestor === null) {
    if (aria.Utils.matches(currentNode.parentNode, selector)) {
      ancestor = currentNode.parentNode;
    } else {
      currentNode = currentNode.parentNode;
    }
  }

  return ancestor;
};

aria.Utils.hasClass = function (element, className) {
  return new RegExp('(\\s|^)' + className + '(\\s|$)').test(element.className);
};

aria.Utils.addClass = function (element, className) {
  if (!aria.Utils.hasClass(element, className)) {
    element.className += ' ' + className;
  }
};

aria.Utils.removeClass = function (element, className) {
  var classRegex = new RegExp('(\\s|^)' + className + '(\\s|$)');
  element.className = element.className.replace(classRegex, ' ').trim();
};

aria.Utils.bindMethods = function (object /* , ...methodNames */) {
  var methodNames = Array.prototype.slice.call(arguments, 1);
  methodNames.forEach(function (method) {
    object[method] = object[method].bind(object);
  });
};

