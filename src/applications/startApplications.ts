import {ApplicationReturn} from './types';
import {applications} from '.';

export async function startApplications(): Promise<ApplicationReturn[]> {
  const applicationsToReturn: ApplicationReturn[] = [];

  // Execute all registered applications
  await Promise.allSettled(
    Object.values(applications).map(async (a) => {
      // Start application
      const applicationResult = await a();

      // Save application results to stop them later
      if (applicationResult) {
        applicationsToReturn.push(applicationResult);
      }
    })
  );

  return applicationsToReturn;
}
