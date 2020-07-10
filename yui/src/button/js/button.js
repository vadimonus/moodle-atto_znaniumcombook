// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Book from znanium.com module
 *
 * @package atto_znaniumcombook
 * @copyright 2020 Vadim Dvorovenko
 * @copyright 2020 ООО «ЗНАНИУМ»
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

var COMPONENTNAME = 'atto_znaniumcombook';
var ANCHOR_TEMPLATE = '<a href="{{url}}"{{#if newwindow}} target="_blank"{{/if}}>{{description}}</a>';
var FORM_TEMPLATE =
    '<form class="atto_form">' +
        '<div class="mb-1">' +
            '<label for="{{elementid}}_atto_znaniumcombook_page">{{get_string "page_modal_page" component}}</label>' +
            '<input class="form-control atto_znaniumcombook_page" type="text" ' +
                'id="{{elementid}}_atto_znaniumcombook_page"/>' +
        '</div>' +
        '<div class="form-check">' +
            '<input type="checkbox" class="form-check-input atto_znaniumcombook_newwindow" '
                + 'id="{{elementid}}_atto_znaniumcombook_newwindow"/>' +
            '<label class="form-check-label" for="{{elementid}}_atto_znaniumcombook_newwindow">' +
                '{{get_string "page_modal_new_window" component}}' +
            '</label>' +
        '</div>' +
        '<div class="mdl-align">' +
            '<br/>' +
            '<button type="submit" class="btn btn-secondary submit">{{get_string "page_modal_button" component}}' +
                '</button>' +
        '</div>' +
    '</form>';

Y.namespace('M.atto_znaniumcombook').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {

    /**
     * A reference to the current selection at the time that the dialogue
     * was opened.
     *
     * @property _currentSelection
     * @type Range
     * @private
     */
    _currentSelection: null,

    /**
     * @property _bookId
     * @type Number
     * @private
     */
    _bookId: null,

    /**
     * @property _description
     * @type String
     * @private
     */
    _description: null,

    /**
     * @property _cover
     * @type String
     * @private
     */
    _cover: null,

    /**
     * @property _page
     * @type String
     * @private
     */
    _page: null,

    /**
     * @property _newWindow
     * @type Boolean
     * @private
     */
    _newWindow: false,

    /**
     * A reference to the dialogue content.
     *
     * @property _pageDialogueContent
     * @type Node
     * @private
     */
    _pageDialogueContent: null,

    /**
     * Add the buttons to the toolbar
     *
     * @method initializer
     */
    initializer: function() {
        this.addButton({
            title: 'button_name',
            icon: 'icon',
            iconComponent: 'atto_znaniumcombook',
            callback: this._displaySearchDialogue,
            buttonName: 'znaniumcombook',
        });

        // Enable the undo once everything has loaded.
        this.get('host').on('pluginsloaded', function() {
            this._updateButtonState();
            this.get('host').on('atto:selectionchanged', this._updateButtonState, this);
        }, this);

    },

    /**
     * Update the states of the buttons.
     *
     * @method _updateButtonState
     * @private
     */
    _updateButtonState: function() {
        if (this._anchorSelected()) {
            this.disableButtons('znaniumcombook');
        } else {
            this.enableButtons('znaniumcombook');
        }
    },

    /**
     * If there is selected text and it is part of an anchor link,
     * extract the url (and target) from the link (and set them in the form).
     *
     * @method _resolveAnchors
     * @private
     */
    _anchorSelected: function() {
        // Find the first anchor tag in the selection.
        var selectednode = this.get('host').getSelectionParentNode();

        // Note this is a document fragment and YUI doesn't like them.
        if (!selectednode) {
            return;
        }

        var anchornodes = this._findSelectedAnchors(Y.one(selectednode));
        return anchornodes.length > 0;
    },

    /**
     * Look up and down for the nearest anchor tags that are least partly contained in the selection.
     *
     * @method _findSelectedAnchors
     * @param {Node} node The node to search under for the selected anchor.
     * @return {Node|Boolean} The Node, or false if not found.
     * @private
     */
    _findSelectedAnchors: function(node) {
        var tagname = node.get('tagName'),
            hit,
            hits;

        // Direct hit.
        if (tagname && tagname.toLowerCase() === 'a') {
            return [node];
        }

        // Search down but check that each node is part of the selection.
        hits = [];
        node.all('a').each(function(n) {
            if (!hit && this.get('host').selectionContainsNode(n)) {
                hits.push(n);
            }
        }, this);
        if (hits.length > 0) {
            return hits;
        }
        // Search up.
        hit = node.ancestor('a');
        if (hit) {
            return [hit];
        }
        return [];
    },

    /**
     * Display the book picker.
     *
     * @method _displaySearchDialogue
     * @private
     */
    _displaySearchDialogue: function() {
        // Store the current selection.
        this._currentSelection = this.get('host').getSelection();
        if (this._currentSelection === false) {
            return;
        }

        // Display modal
        var modname = 'atto_znaniumcombook/bookpicker-lazy';
        var that = this;
        M.util.js_pending(modname);
        require([modname], function(amd) {
            M.util.js_complete(modname);
            amd.init(that._onBookSelected.bind(that));
        });
    },

    /**
     * On book select
     *
     * @method _onBookSelected
     * @param {Number} id
     * @param {String} description
     * @param {String} cover
     * @private
     */
    _onBookSelected: function(id, description, cover) {
        this._bookId = id;
        this._description = description;
        this._cover = cover;

        this._displayPageDialogue();
    },

    /**
     * Display enter page dialogue
     *
     * @method _displayPageDialogue
     * @private
     */
    _displayPageDialogue: function() {
        var dialogue = this.getDialogue({
            headerContent: M.util.get_string('page_modal_title', COMPONENTNAME),
            width: 'auto',
            focusAfterHide: true,
            focusOnShowSelector: '.atto_znaniumcombook_page'
        });

        // Set the dialogue content, and then show the dialogue.
        dialogue.set('bodyContent', this._getPageDialogueContent());

        dialogue.show();
    },


    /**
     * Generates the content of page dialogue.
     *
     * @method _getPageDialogueContent
     * @return {Node} Node containing the dialogue content
     * @private
     */
    _getPageDialogueContent: function() {
        var template = Y.Handlebars.compile(FORM_TEMPLATE);
        this._pageDialogueContent = Y.Node.create(template({
            component: COMPONENTNAME,
        }));

        this._pageDialogueContent.one('.submit').on('click', this._onPageEntered, this);

        return this._pageDialogueContent;
    },

    /**
     * On book select
     *
     * @method _onPageEntered
     * @param {EventFacade} e
     * @private
     */
    _onPageEntered: function(e) {
        e.preventDefault();
        this.getDialogue({
            focusAfterHide: null
        }).hide();

        var page = this._pageDialogueContent.one('.atto_znaniumcombook_page').get('value').trim();
        var expr = new RegExp(/^[0-9]+$/);
        if (expr.test(page)) {
            this._page = page;
        } else {
            this._page = null;
        }

        this._newWindow = !!this._pageDialogueContent.one('.atto_znaniumcombook_newwindow').get('checked');

        this._insertHyperlink();
    },

    /**
     * Insert hyperlink
     *
     * @method _insertHyperlink
     * @private
     */
    _insertHyperlink: function() {
        var host = this.get('host');

        // Focus on the previous selection.
        host.setSelection(this._currentSelection);

        var html = this._getHtml();

        // And add the url.
        host.insertContentAtFocusPoint(html);

        this.markUpdated();
    },

    /**
     * Get Html to insert
     *
     * @method _getHtml
     * @private
     */
    _getHtml: function() {
        var url = M.cfg.wwwroot + '/blocks/znanium_com/redirect.php?documentid=' + this._bookId;
        if (this._page) {
            url = url + '&page=' + this._page;
        }
        var template = Y.Handlebars.compile(ANCHOR_TEMPLATE);
        return template({
            url: url,
            description: this._description,
            cover: this._cover,
            newwindow: this._newWindow,
        });
    },

});
