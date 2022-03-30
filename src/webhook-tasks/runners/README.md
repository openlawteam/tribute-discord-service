**Add runners for `./events` and `./actions`.**

Runners establish the processes which watch for any events and run any actions.

**Updating which runners are executed**

Runners are `import`ed, looped over and then executed.

To change which runners are executed, edit a `registry.ts` file, at any directory level desired, and change what is exported.
