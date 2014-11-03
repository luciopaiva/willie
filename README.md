# Willie

A companion to [Winston](//github.com/flatiron/winston).

## Installation

```bash
npm install willie
```

## Features

Willie is capable of producing a log output with indentation, so that you can better visualize what's happening in your output.

Example code:

```javascript
var
  willie = require('willie');
  
willie.logToConsole();

willie
  .hr()
  .info('Willie')
  .indent()
  .info('This line will be indented')
  .error('This one is correctly aligned to the above line, despite having a different level')
```

Will produce the following output:

```text
23:55:47.501 -    info: --------------------------------------------------------------------------------
23:55:47.504 -    info: Willie
23:55:47.504 -    info: .   This line will be indented
23:55:47.504 -   error: .   This one is correctly aligned to the above line, despite having a different level
```
