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

import ModalFactory from 'core/modal_factory';
import ModalEvents from 'core/modal_events';
import Vue from 'vue';
import Vuex from 'vuex';
import BookPickerModalBody from '../../../../../../mod/znaniumcombook/vue/book_picker_modal_body';
import storeDefinition from '../../../../../../mod/znaniumcombook/vue/store';

export default class BookPickerModal {

    constructor(callback) {
        this.bookSelectedCallback = callback;
    }

    async show() {
        Vue.use(Vuex);
        this.store = new Vuex.Store(storeDefinition);
        await this.store.dispatch('loadComponentStrings');

        this.modal = await ModalFactory.create({
            type: ModalFactory.types.CANCEL,
            title: this.store.state.strings.modal_title,
            body: '',
        });

        this.modal.setLarge();

        this.modal.getRoot().on(ModalEvents.hidden, function () {
            this.vue.$destroy();
            this.modal.setBody('');
        }.bind(this));

        this.modal.getRoot().on(ModalEvents.shown, function () {
            const template = '<div id="book-picker-modal-body"><book-picker-modal-body @book-selected="onBookSelected"></book-picker-modal-body></div>';
            this.modal.setBody(template);

            const that = this;
            that.vue = new Vue({
                el: '#book-picker-modal-body',
                name: 'BookPickerModalWrapper',
                components: {
                    BookPickerModalBody,
                },
                methods: {
                    onBookSelected: function () {
                        if (that.bookSelectedCallback) {
                            let book = this.$store.state.selectedBook;
                            that.bookSelectedCallback(book.id, book.description, book.cover);
                        }
                    },
                },
                store: this.store,
            });
        }.bind(this));

        this.modal.show();
    }

    hide() {
        this.modal.hide();
    }
}
