import {ApplicationNames} from '../config';

export type ApplicationReturn = {
  /**
   * Friendly name for the application.
   */
  name: ApplicationNames;
  /**
   * A callback to destroy the application instance, etc.
   */
  stop?: () => Promise<any>;
};
