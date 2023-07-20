import { TribeClient } from '@tribeplatform/gql-client'
import { globalLogger } from '@utils'


const logger = globalLogger.setContext('MemberSubscriptionHelpers')
//requires gqp client and member id to retrive the data
const getAllMemberSpaces = async (gqlClient: TribeClient, id: string) => {
    const spaces = []
    let hasNextPage = true
    let after = null
    while (hasNextPage) {
        const currentBatch = await gqlClient.query({
            name: 'memberSpaces',
            args: {
                variables: { memberId: id, limit: 100, after },
                fields: {
                    nodes: {
                        space: 'basic',
                    },
                    pageInfo: 'all',
                },
            },
        })
        after = currentBatch.pageInfo.endCursor
        currentBatch?.nodes?.forEach(spaceMember => spaces.push(spaceMember?.space))
        hasNextPage = currentBatch.pageInfo.hasNextPage
    }
    return spaces
}