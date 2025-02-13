import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';
import { useCurrentUserContext } from '../context/UserContext';
import { asyncFetch } from '../data/graphql/graphql-fetcher';
import {
  ApiUser,
  signInUserMutation,
  SignInUserMutationResponse,
} from '../data/graphql/snippets/user';

function useUserSignIn(): readonly [
  boolean,
  ApiUser | undefined,
  ((currentUser: ApiUser | undefined) => void) | undefined,
] {
  const { user, isLoading } = useUser();

  const { currentUser, setCurrentUser } = useCurrentUserContext();
  const [isLoadingPlaceholders, setIsLoadingPlaceholders] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoadingPlaceholders(true);
      asyncFetch<SignInUserMutationResponse>(signInUserMutation, {
        input: {
          email: user.email,
          auth0Id: user.sub,
          name: user.name,
          picture: user.picture,
        },
      }).then((data: SignInUserMutationResponse) => {
        setCurrentUser && setCurrentUser(data.userSignIn.user);
        setIsLoadingPlaceholders(false);
      });
    } else {
      setIsLoadingPlaceholders(false);
    }
  }, [user, setCurrentUser]);

  return [
    isLoading || isLoadingPlaceholders,
    currentUser,
    setCurrentUser,
  ] as const;
}

export { useUserSignIn };
