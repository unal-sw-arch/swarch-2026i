import React from 'react'
import { Text, StyleProp, TextStyle } from 'react-native'
import { Link, LinkProps } from 'expo-router'
import { useThemeColor } from '../hooks/use-theme-color'

interface Props extends LinkProps {
    style?: StyleProp<TextStyle>
    children?: React.ReactNode
}

const ThemedLink: React.FC<Props> = ({ style, children, ...rest }) => {
    const primaryColor = useThemeColor({}, 'primary')

    return (
        <Link {...(rest as any)}>
            <Text style={[{ color: primaryColor }, style]}>{children}</Text>
        </Link>
    )
}

export default ThemedLink