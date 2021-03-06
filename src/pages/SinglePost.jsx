import React, { useContext, useState, useRef } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { gql, useQuery, useMutation } from '@apollo/client'
import { Card, Grid, Image, Label, Button, Icon, Form } from 'semantic-ui-react'

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { AuthContext } from '../contexts/auth'
import LikeButton from '../components/LikeButton';
import DeleteButton from '../components/DeleteButton';
import MyPopup from '../components/MyPopup';

dayjs.extend(relativeTime);

const SinglePost = () => {
    const { user } = useContext(AuthContext)

    const { postId } = useParams()
    const { push } = useHistory()

    const commentInputRef = useRef()
    const [comment, setComment] = useState('')

    const { data } = useQuery(FETCH_POST_QUERY, {
        variables: {
            postId,
        }
    })

    const [submitComment] = useMutation(SUBMIT_COMMIT_MUTATION, {
        variables: {
            postId,
            body: comment
        },
        update() {
            setComment('')
            commentInputRef.current.blur()
        }
    })

    const deletePostCallback = () => {
        push('/')
    }


    let postMarkup;
    if (!data?.getPost) {
        postMarkup = (<p>Loading post...</p>)
    } else {
        const { id, body, createdAt, username, comments, likes, likeCount, commentCount } = data?.getPost

        postMarkup = (
            <Grid>
                <Grid.Row>
                    <Grid.Column width={2}>
                        <Image src="https://react.semantic-ui.com/images/avatar/large/steve.jpg"
                            size='small'
                            floated='right'
                        />
                    </Grid.Column>
                    <Grid.Column width={10}>
                        <Card fluid>
                            <Card.Content>
                                <Card.Header>{username}</Card.Header>
                                <Card.Meta>{dayjs(createdAt).fromNow(true)}</Card.Meta>
                                <Card.Description>{body}</Card.Description>
                            </Card.Content>
                            <hr />
                            <Card.Content extra>
                                <LikeButton user={user} post={{ id, likeCount, likes }} />
                                <MyPopup content='Comment on post'>
                                    <Button as='div' labelPosition='right' onClick={() => console.log('Comment on Post')}>
                                        <Button color='blue' basic >
                                            <Icon name='comments' />
                                        </Button>
                                        <Label basic color='blue' pointing='left'>
                                            {commentCount}
                                        </Label>
                                    </Button>
                                </MyPopup>
                                {user && user.username === username && <DeleteButton postId={id} callback={deletePostCallback} />}
                            </Card.Content>
                        </Card>
                        {user && (
                            <Card fluid>
                                <Card.Content>
                                    <p>Post a comment</p>
                                    <Form>
                                        <div className="ui action input fluid">
                                            <input
                                                type="text"
                                                placeholder="Comment..."
                                                name="comment"
                                                value={comment}
                                                onChange={(event) => setComment(event.target.value)}
                                                ref={commentInputRef}
                                            />
                                            <button
                                                className="ui button teal"
                                                type="submit"
                                                disabled={comment.trim() === ''}
                                                onClick={submitComment}
                                            >
                                                Submit
                                            </button>
                                        </div>
                                    </Form>
                                </Card.Content>
                            </Card>
                        )}
                        {comments.map(comment => (
                            <Card fluid key={comment.id}>
                                <Card.Content>
                                    {user && user.username === comment.username && (
                                        <DeleteButton postId={id} commentId={comment.id} />
                                    )}
                                    <Card.Header>{comment.username}</Card.Header>
                                    <Card.Meta>{dayjs(comment.createdAt).fromNow(true)}</Card.Meta>
                                    <Card.Description>{comment.body}</Card.Description>
                                </Card.Content>
                            </Card>
                        ))}
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        )

    }

    return postMarkup
}

const SUBMIT_COMMIT_MUTATION = gql`
    mutation($postId: String!, $body: String!){
        createComment(postId: $postId, body: $body){
            id 
            comments {
                id body createdAt username
            }
            commentCount
        }
    }
`

const FETCH_POST_QUERY = gql`
    query($postId: ID!){
        getPost(postId: $postId) {
            id
            body
            createdAt
            username
            comments {
                id
                username
                createdAt
                body
            }
            likes {
                username
            }
            likeCount
            commentCount
        }
    }
`

export default SinglePost
