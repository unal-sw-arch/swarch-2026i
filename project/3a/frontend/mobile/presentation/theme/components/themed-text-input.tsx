import { View, Text, TextInputProps, StyleSheet, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import React, { useRef, useState } from 'react'
import { useThemeColor } from '../hooks/use-theme-color';

interface Props extends TextInputProps {
    icon?: keyof typeof Ionicons.glyphMap;
}

const ThemedTextInput = ({ icon, ...rest } : Props) => {

    const primaryColor = useThemeColor({}, 'primary')
    const textColor = useThemeColor({}, 'text')    

    const [isActive, setIsActive] = useState(false);
    const inputRef = useRef<TextInput>(null)

    return (
        <View
            style={[
                styles.border,
                {
                    borderColor: isActive ? primaryColor : '#e5e7eb',
                    backgroundColor: '#fafafa',
                }
            ]}
            onTouchStart={() => inputRef.current?.focus()}
        >
            {icon && (
                <Ionicons
                    name={icon}
                    size={20}
                    color={isActive ? primaryColor : '#9ca3af'}
                    style={{ marginRight: 10 }}
                />
            )}    
            <TextInput
                ref={inputRef}
                placeholderTextColor="#9ca3af"
                onFocus={() => setIsActive(true)}
                onBlur={() => setIsActive(false)}
                style={{
                    color: textColor,
                    fontSize: 15,
                    flex: 1,
                    paddingVertical: 0, // Reset default Android padding
                }}
                {...rest}
            />

        </View>
    )
}

export default ThemedTextInput


const styles = StyleSheet.create({
    border: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center'
    }
})