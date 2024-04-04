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
import {createApp} from 'vue';
import {createStore} from 'vuex';
import BookPickerModalBody from './book_picker_modal_body';
import storeDefinition from './store';

export default class BookPickerModal {
    async show(bookSelectedCallback) {
        const store = createStore(storeDefinition);
        await store.dispatch('loadComponentStrings');

        let moodleModal = await ModalFactory.create({
            type: ModalFactory.types.CANCEL,
            title: store.state.strings.modal_title,
            body: '<div id="book-picker-modal-body"></div>',
        });
        let vue;

        moodleModal.setLarge();

        moodleModal.getRoot().on(ModalEvents.hidden, function () {
            vue.unmount();
            moodleModal.destroy();
        });

        moodleModal.getRoot().on(ModalEvents.shown, function () {
            vue = createApp({
                name: 'BookPickerModalWrapper',
                components: {
                    BookPickerModalBody,
                },
                template: '<book-picker-modal-body @book-selected="onBookSelected"></book-picker-modal-body>',
                methods: {
                    onBookSelected: function () {
                        if (bookSelectedCallback) {
                            let book = store.state.selectedBook;
                            bookSelectedCallback(book.id, book.description, book.cover);
                        }
                        moodleModal.hide();
                    },
                },
            });
            vue.use(store);
            vue.mount('#book-picker-modal-body');
        });

        moodleModal.show();
    }
}
