<?php
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

/**
 * Initialise the js strings required for this plugin
 */
function atto_znaniumcombook_strings_for_js() {
    global $PAGE;

    $strings = array(
        'button_name',
        'page_modal_button',
        'page_modal_new_window',
        'page_modal_page',
        'page_modal_title',
    );
    $PAGE->requires->strings_for_js($strings, 'atto_znaniumcombook');
}

/**
 * Sends the parameters to the JS module.
 *
 * @return array
 */
function atto_znaniumcombook_params_for_js() {
    return array();
}
