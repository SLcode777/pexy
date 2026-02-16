import { Colors } from "@/constants/colors";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Vibration,
} from "react-native";

interface PINCodeModalProps {
  visible: boolean;
  onSuccess: () => void;
  correctPIN: string;
  onCancel?: () => void;
}

export default function PINCodeModal({
  visible,
  onSuccess,
  correctPIN,
  onCancel,
}: PINCodeModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleNumberPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);

      // Vérifier automatiquement quand on a 4 chiffres
      if (newPin.length === 4) {
        setTimeout(() => {
          if (newPin === correctPIN) {
            onSuccess();
            setPin("");
          } else {
            setError(true);
            Vibration.vibrate(500);
            setTimeout(() => {
              setPin("");
              setError(false);
            }, 1000);
          }
        }, 100);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      setPin("");
      setError(false);
      onCancel();
    }
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              pin.length > index && styles.dotFilled,
              error && styles.dotError,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderKeypad = () => {
    const numbers = [
      ["1", "2", "3"],
      ["4", "5", "6"],
      ["7", "8", "9"],
      ["", "0", "⌫"],
    ];

    return (
      <View style={styles.keypad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((num, numIndex) => {
              if (num === "") {
                return <View key={numIndex} style={styles.keyButton} />;
              }
              if (num === "⌫") {
                return (
                  <TouchableOpacity
                    key={numIndex}
                    style={styles.keyButton}
                    onPress={handleDelete}
                  >
                    <Text style={styles.keyText}>{num}</Text>
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={numIndex}
                  style={styles.keyButton}
                  onPress={() => handleNumberPress(num)}
                >
                  <Text style={styles.keyText}>{num}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>🔒 Code PIN</Text>
          <Text style={styles.subtitle}>
            Entrez le code pour accéder aux paramètres
          </Text>

          {renderDots()}

          {error && (
            <Text style={styles.errorText}>Code incorrect, réessayez</Text>
          )}

          {renderKeypad()}

          {onCancel && (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>← Retour</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 32,
    width: "85%",
    maxWidth: 400,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 32,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  dotFilled: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dotError: {
    backgroundColor: Colors.coral,
    borderColor: Colors.coral,
  },
  keypad: {
    gap: 12,
  },
  keypadRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  keyButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  keyText: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.text,
  },
  errorText: {
    color: Colors.coral,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
  },
  cancelButton: {
    marginTop: 16,
    padding: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
});
