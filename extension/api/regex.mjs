/*
 * notion-enhancer: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/**
 * pattern validators
 * @module notion-enhancer/api/regex
 */

const patterns = {
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  semver:
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/i,
  email:
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i,
  url: /^[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/i,
  color: /^(?:#|0x)(?:[a-f0-9]{3}|[a-f0-9]{6})\b|(?:rgb|hsl)a?\([^\)]*\)$/i,
};

function test(str, pattern) {
  const match = str.match(pattern);
  return match && match.length;
}

/**
 * check for a valid uuid (8-4-4-4-12 hexadecimal digits)
 * @param {string} str - the string to test
 * @returns {boolean} whether or not the test passed successfully
 */
export const uuid = (str) => test(str, patterns.uuid);

/**
 * check for a valid semver (MAJOR.MINOR.PATCH)
 * @param {string} str - the string to test
 * @returns {boolean} whether or not the test passed successfully
 */
export const semver = (str) => test(str, patterns.semver);

/**
 * check for a valid email (e.g. someone@somewhere.domain)
 * @param {string} str - the string to test
 * @returns {boolean} whether or not the test passed successfully
 */
export const email = (str) => test(str, patterns.email);

/**
 * check for a valid url (e.g. https://example.com/path)
 * @param {string} str - the string to test
 * @returns {boolean} whether or not the test passed successfully
 */
export const url = (str) => test(str, patterns.url);

/**
 * check for a valid color (https://regexr.com/39cgj)
 * @param {string} str - the string to test
 * @returns {boolean} whether or not the test passed successfully
 */
export const color = (str) => test(str, patterns.color);
