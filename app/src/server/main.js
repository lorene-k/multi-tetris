import params from '../../params'
import * as server from './index'

server.create(params.server).then(() => {
    console.log(`Server running at http://${params.server.host}:${params.server.port}/`)
})
