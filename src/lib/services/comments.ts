export interface Comment {
    id: string
    content: string
    created_at: string
    user_id: string
    profile: {
        id: string
        username: string | null
        full_name: string | null
        avatar_url: string | null
    }
}

export async function getComments(dreamId: string): Promise<Comment[]> {
    const response = await fetch(`/api/comments?dreamId=${dreamId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error('Failed to fetch comments')
    }

    return response.json()
}

export async function createComment(dreamId: string, content: string): Promise<Comment> {
    const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dreamId, content }),
    })

    if (!response.ok) {
        throw new Error('Failed to create comment')
    }

    return response.json()
}

export async function deleteComment(commentId: string): Promise<void> {
    const response = await fetch(`/api/comments?commentId=${commentId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error('Failed to delete comment')
    }
}
