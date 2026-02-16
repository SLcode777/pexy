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

interface SetPINModalProps {
  visible: boolean;
  onSuccess: (pin: string) => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
}

export default function SetPINModal({
  visible,
  onSuccess,
  onCancel,
  title = "🔐 Définir un code PIN",
  subtitle = "Choisissez un code à 4 chiffres",
}: SetPINModalProps) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [error, setError] = useState("");

  const handleNumberPress = (num: string) => {
    if (step === "enter") {
      if (pin.length < 4) {
        const newPin = pin + num;
        setPin(newPin);
        setError("");

        // Passer à la confirmation automatiquement
        if (newPin.length === 4) {
          setTimeout(() => {
            setStep("confirm");
          }, 300);
        }
      }
    } else {
      if (confirmPin.length < 4) {
        const newConfirmPin = confirmPin + num;
        setConfirmPin(newConfirmPin);
        setError("");

        // Vérifier automatiquement quand on a 4 chiffres
        if (newConfirmPin.length === 4) {
          setTimeout(() => {
            if (newConfirmPin === pin) {
              onSuccess(pin);
              resetState();
            } else {
              setError("Les codes ne correspondent pas");
              Vibration.vibrate(500);
              setTimeout(() => {
                setConfirmPin("");
                setPin("");
                setStep("enter");
                setError("");
              }, 1500);
            }
          }, 100);
        }
      }
    }
  };

  const handleDelete = () => {
    if (step === "enter") {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
    setError("");
  };

  const handleCancel = () => {
    if (onCancel) {
      resetState();
      onCancel();
    }
  };

  const resetState = () => {
    setPin("");
    setConfirmPin("");
    setStep("enter");
    setError("");
  };

  const renderDots = () => {
    const currentPin = step === "enter" ? pin : confirmPin;
    return (
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentPin.length > index && styles.dotFilled,
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
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {step === "enter"
              ? subtitle
              : "Confirmez votre code PIN"}
          </Text>

          {renderDots()}

          {error && <Text style={styles.errorText}>{error}</Text>}

          {renderKeypad()}

          {onCancel && (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
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
    fontSize: 14,
    fontWeight: "600",
  },
});
