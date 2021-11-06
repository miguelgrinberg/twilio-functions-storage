const Storage = (context) => {
  let vars = {};

  if (context.SERVICE_SID) {
    for (variable in context) {
      if (variable.startsWith('S_')) {
        vars[variable.substring(2)] = context[variable];
      }
    }
  }
  else {
    vars = require('dotenv').config({ path: 'storage.env' }).parsed || {};
  }

  return {
    get length() {
      return Object.keys(vars).length;
    },

    key: (n) => {
      return Object.keys(vars)[n];
    },

    getItem: (keyname) => {
      return vars[keyname];
    },

    setItem: (keyname, value) => {
      vars[keyname] = value;
    },

    removeItem: (keyname) => {
      delete vars[keyname];
    },

    clear: () => {
      vars = {};
    },

    save: async() => {
      if (context.SERVICE_SID) {
        const resource = context.getTwilioClient().serverless
          .services(context.SERVICE_SID)
          .environments(context.ENVIRONMENT_SID)
          .variables;
        const currentVariables = await resource.list();
        for (variable in vars) {
          const remoteVariable = 'S_' + variable;
          const existingVariable = currentVariables.find(v => v.key == remoteVariable);
          if (existingVariable) {
            await existingVariable.update({ value: `${vars[variable]}` });
          }
          else {
            await resource.create({ key: remoteVariable, value: `${vars[variable]}` });
          }
        }
        for (let i = 0; i < currentVariables.length; i++) {
          const existingVariable = currentVariables[i];
          if (!existingVariable.key.startsWith('S_')) {
            continue;
          }
          const variable = existingVariable.key.substring(2);
          if (vars[variable] === undefined) {
            await existingVariable.remove();
          }
        }
      }
      else {
        env = '';
        for (variable in vars) {
          env += `${variable}=${vars[variable]}\n`;
        }
        await require('fs').promises.writeFile('storage.env', env);
      }
    },
  };
};

module.exports = Storage;
