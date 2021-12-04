# gql-schema-cli
You can easily generate graphql schema.

## Installation
```bash
npm install gql-schema-cli
```

## Useage
```bash
gsc tpl createAccount
---
users/createAccount/createAccount.resolvers.js creation complete
users/createAccount/createAccount.typeDefs.js creation complete
```

## Options

### root
root folder name
- default: users

### type
scheme type: Query | Mutation
- default: Query

## Template

### {{root}}/{{schema}}/{{schema}}.resolvers.js
```js
import client from '../../client'
  import { protectedResolver } from '../users.utility'
  
  const {{schema}}ResolverFn = async (
    _,
    {  },
    { loggedInUser }
  ) => {
    if () {
      return {
        ok: true,
      }
    } else {
      return {
        ok: false,
        error: '.',
      }
    }
  }
  
  export default {
    Mutation: {
      editProfile: protectedResolver({{schema}}ResolverFn),
    },
  }
  
```

### {{root}}/{{schema}}/{{schema}}.typeDefs.js
```js
import { gql } from 'apollo-server'
  
  export default gql`
    type {{schema}}Result {
      ok: Boolean!
      error: String
    }
    type {{type}} {
      editProfile(
        firstName: String
        lastName: String
        username: String
        email: String
        password: String
        bio: String
        avatar: Upload
      ): {{schema}}Result!
    }
  `
  
```
