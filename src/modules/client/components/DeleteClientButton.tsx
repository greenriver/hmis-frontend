import { Button, ButtonProps } from '@mui/material'
import React, { useCallback, useState } from 'react'

import { ErrorState, emptyErrorState, partitionValidations } from '@/modules/errors/util';
import { DeleteClientFileMutation, useDeleteClientMutation } from '@/types/gqlTypes'

export interface DeleteClientButtonProps extends ButtonProps {
  clientId: string
  onCompleted?: (data: DeleteClientFileMutation) => any
}

const DeleteClientButton: React.FC<DeleteClientButtonProps> = ({ clientId, onCompleted, ...props }) => {
  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);
  const [deleteClient, { loading }] = useDeleteClientMutation()

  const handleDelete = useCallback((confirmed?: boolean) => {
    deleteClient({
      variables: { input: { id: clientId, confirmed } },
      onCompleted: (data) => {
        const errors = data.deleteClient?.errors || [];

        if (errors.length > 0) {
          setErrors(partitionValidations(errors));
        } else {
          setErrors(emptyErrorState);
        }
        if (onCompleted) onCompleted(data);
      },
      onError: (apolloError) => setErrors({ ...emptyErrorState, apolloError }),
    })
  }, [deleteClient, clientId, onCompleted])

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        fullWidth
        onClick={() => handleDelete()}
        {...props}
      >
        Delete Client
      </Button>
    </>
  )
}

export default DeleteClientButton
