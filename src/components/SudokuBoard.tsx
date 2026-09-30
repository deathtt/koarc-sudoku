// src/components/SudokuBoard.tsx
import React from "react";
import { View, Text, TextInput, StyleSheet, useWindowDimensions } from "react-native";
import { Grid } from "../utils/sudokuGenerator";
import { theme } from "../theme";

interface Props {
  givens: Grid;
  values: Grid;
  wrongCells?: Set<string>;
  checked?: boolean;
  editable?: boolean;
  onChange: (row: number, col: number, value: number) => void;
}

export default function SudokuBoard({ givens, values, wrongCells, checked, editable = true, onChange }: Props) {
  const { width } = useWindowDimensions();
  const size = Math.min(width - 32, 400);
  const cell = size / 9;

  return (
    <View style={[styles.board, { width: size, height: size }]}>
      {values.map((row, r) =>
        row.map((v, c) => {
          const given = givens[r]![c] !== 0;
          const isWrong = wrongCells?.has(`${r},${c}`);
          const tint = !given && checked && v !== 0
            ? isWrong ? theme.colors.incorrect : theme.colors.correct
            : theme.colors.white;
          const txt = !given && checked && v !== 0
            ? isWrong ? theme.colors.incorrectText : theme.colors.correctText
            : given ? theme.colors.accentDeep : theme.colors.ink;
          return (
            <View
              key={`${r}-${c}`}
              style={{
                position: "absolute",
                left: c * cell,
                top: r * cell,
                width: cell,
                height: cell,
                backgroundColor: tint,
                borderRightWidth: c === 8 ? 0 : c % 3 === 2 ? 2 : 0.5,
                borderBottomWidth: r === 8 ? 0 : r % 3 === 2 ? 2 : 0.5,
                borderColor: theme.colors.accentDeep,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {given ? (
                <Text style={{ fontSize: cell * 0.5, fontWeight: "700", color: txt }}>{v}</Text>
              ) : (
                <TextInput
                  style={{ width: "100%", height: "100%", textAlign: "center", fontSize: cell * 0.5, fontWeight: "600", color: txt }}
                  keyboardType="number-pad"
                  maxLength={1}
                  editable={editable}
                  value={v === 0 ? "" : String(v)}
                  onChangeText={(t) => {
                    const n = parseInt(t.replace(/[^1-9]/g, "").slice(-1) || "0", 10);
                    onChange(r, c, n);
                  }}
                />
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.accentDeep,
    borderRadius: 6,
    overflow: "hidden",
  },
});
