import Link from 'next/link';
import { Box, Button, Container, Flex } from '@chakra-ui/react';
import Layout from '../components/layout';
import { theme } from '../styles/theme';
import BasicLoader from '../components/BasicLoader';
import { useUserSignIn } from '../hooks/use-user-sign-in.hook';

export default function Home() {
  const [isLoading, currentUser] = useUserSignIn();

  if (isLoading) <BasicLoader />;

  return (
    <Layout home>
      <Container pos="relative" mt={5} p={0} width="100%" maxW="inherit">
        {currentUser ? (
          <>
            hey
            <Link href="/api/auth/logout?returnTo=http%3A%2F%2Flocalhost%3A3000">
              Logout
            </Link>
          </>
        ) : (
          <Box h="80vh">
            <Flex h="100%" justifyContent={'center'} alignSelf={'center'}>
              <Link href="/api/auth/login">
                <Button
                  size={'lg'}
                  fontSize={'2xl'}
                  w={'30vw'}
                  h={'6vh'}
                  textColor={theme.colors.gray['100']}
                  colorScheme="brandSecondary"
                  mt="40vh"
                  p={5}
                >
                  Login
                </Button>
              </Link>
            </Flex>
          </Box>
        )}
      </Container>
    </Layout>
  );
}
