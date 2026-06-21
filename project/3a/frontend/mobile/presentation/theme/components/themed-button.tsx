import { View, Text, PressableProps, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../hooks/use-theme-color';

interface Props extends PressableProps {
    children: string;
    icon?: keyof typeof Ionicons.glyphMap;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
}

const ThemedButton = ({ children, icon, variant = 'default', ...rest}: Props) => {

    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');

    const getStyles = (pressed: boolean) => {
        let backgroundColor = 'transparent';
        let borderColor = 'transparent';
        let borderWidth = 0;
        let contentColor = 'white';

        switch (variant) {
            case 'default':
                backgroundColor = pressed ? (primaryColor + 'c0') : primaryColor;
                contentColor = 'white';
                break;
            case 'secondary':
                backgroundColor = pressed ? '#e4e4e7' : '#f4f4f5';
                contentColor = '#18181b';
                break;
            case 'destructive':
                backgroundColor = pressed ? '#dc2626' : '#ef4444';
                contentColor = 'white';
                break;
            case 'outline':
                backgroundColor = pressed ? 'rgba(0,0,0,0.05)' : 'transparent';
                borderColor = '#e4e4e7';
                borderWidth = 1;
                contentColor = textColor;
                break;
            case 'ghost':
                backgroundColor = pressed ? 'rgba(0,0,0,0.05)' : 'transparent';
                contentColor = textColor;
                break;
        }

        return {
            button: {
                backgroundColor,
                borderColor,
                borderWidth,
            },
            text: {
                color: contentColor,
            }
        };
    };

    return (
        <Pressable
            {...rest}
            style={({pressed}) => [
                getStyles(pressed).button,
                styles.button,
            ]}
        >
            {({ pressed }) => {
                const colors = getStyles(pressed);
                return (
                    <>
                        <Text style={[styles.text, colors.text]}>{ children }</Text>

                        {icon && (
                            <Ionicons
                                name={icon}
                                size={18}
                                color={colors.text.color}
                                style={{ marginLeft: 6 }}
                            />
                        )}
                    </>
                );
            }}
        </Pressable>
    )
}

export default ThemedButton;


const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    text: {
        fontSize: 15,
        fontWeight: '600',
    }
})