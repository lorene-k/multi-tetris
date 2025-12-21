import { params } from '../../params.js'
import * as server from './index.js'

server.create(params.server).then(() => {
    console.log(`Server running at http://${params.server.host}:${params.server.port}/`)
})
