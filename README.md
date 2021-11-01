# twilio-functions-storage
Storage object for Twilio serverless functions that is compatible with the Web Storage API.

## Example

```javascript
const Storage = require('twilio-functions-storage');

exports.handler = async function(context, event, callback) {
  // create a storage object
  const storage = Storage(context);

  // get a variable
  const test = storage.getItem('test');

  // set a variable
  storage.setItem('foo', 'bar');

  // delete a variable
  storage.removeItem('old');

  // save() must be called before exiting to preserve changes
  await storage.save();

  callback();
}
```

## Implementation Notes

Internally, this package uses [Environment Variable](https://www.twilio.com/docs/runtime/functions-assets-api/api/variable)
resources to permanently store data. All the variables created by this package
begin with the prefix `S_`.

### Limits

The following are the limitations of this implementation:

- Item values cannot be longer than 450 bytes.
- The Twilio Runtime allocates approximately 3KB for environment variable storage.
