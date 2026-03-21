# Add to todo later

- each npm script should be inlined in package.json if it is a shell one-liner, like `clean` and `nuke` are; the only essential effect in those is `rm`; non-essential output should be avoided
- make `nuke` call `clean` so improvement to latter can be done in one place only 
- in general, try to follow DRY (don't repeat yourself) harder
- in general, try to avoid corner cases and even ignore rare error cases to avoid complicating code.
