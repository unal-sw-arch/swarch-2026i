import { Stack } from 'expo-router';
import LogOutButton from '@/presentation/auth/components/LogOutButton';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Click & Munch',
          headerLeft: () => <LogOutButton />,
        }}
      />
    </Stack>
  );
}
