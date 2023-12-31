import $ from 'jquery';

import { Controller } from '@hotwired/stimulus';
import type { Application } from '@hotwired/stimulus';
import { domReady } from '../utils/domReady';

declare global {
  interface JQuery {
    tagit: (options: Record<string, any> | string) => void;
  }

  interface Window {
    initTagField: (
      id: string,
      url: string,
      options?: Record<string, any>,
    ) => void;
  }
}

/**
 * Attach the jQuery tagit UI to the controlled element.
 *
 * See https://github.com/aehlke/tag-it
 *
 * @example
 * <input id="id_tags" type="text" name="tags" data-controller="w-tag" data-w-tag-url-value="/admin/tag-autocomplete/" />
 */
export class TagController extends Controller {
  static values = {
    options: { default: {}, type: Object },
    url: String,
  };

  declare optionsValue: any;
  declare urlValue: any;
  tagit?: JQuery<HTMLElement>;

  /**
   * Prepare a global function that preserves the previous approach to
   * registering a tagit field. This will be removed in a future release.
   *
   * @deprecated RemovedInWagtail60
   */
  static afterLoad(
    identifier: string,
    { schema: { controllerAttribute } }: Application,
  ) {
    window.initTagField = (id, url, options = {}): void => {
      domReady().then(() => {
        const tagFieldElement = document.getElementById(id);

        if (!tagFieldElement || !url) return;

        Object.entries({ options: JSON.stringify(options), url }).forEach(
          ([name, value]) => {
            tagFieldElement.setAttribute(
              `data-${identifier}-${name}-value`,
              value,
            );
          },
        );

        tagFieldElement.setAttribute(controllerAttribute, identifier);
      });
    };
  }

  connect() {
    const preprocessTag = this.cleanTag.bind(this);

    $(this.element).tagit({
      autocomplete: { source: this.urlValue },
      preprocessTag,
      ...this.optionsValue,
    });
  }

  /**
   * Double quote a tag if it contains a space
   * and if it isn't already quoted.
   */
  cleanTag(val: string) {
    return val && val[0] !== '"' && val.indexOf(' ') > -1 ? `"${val}"` : val;
  }

  /**
   * Method to clear all the tags that are set.
   */
  clear() {
    $(this.element).tagit('removeAll');
  }
}
