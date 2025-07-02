import {http} from './http'

await http.listen({
  port: 8000,
  host: '0.0.0.0',
})
