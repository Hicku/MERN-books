import gql from 'graphql-tag'

export const GET_ME = gql`
{
    _id
    username
    email
    bookCount
    savedBooks {
        #_id
        bookId
        authors
        image
        link
        title
        description
    }
}
`;