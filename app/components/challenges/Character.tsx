import styles from "./Character.module.css";

type AnimationState = "run" | "jump" | "stumble";

type CharacterProps = {
  animationState: AnimationState;
};

export default function Character({ animationState }: CharacterProps) {
  const className =
    animationState === "run"
      ? `${styles.character} ${styles.run}`
      : styles.character;

  return (
    <div
      data-animation-state={animationState}
      aria-label="survival character"
      className={className}
      style={{
        backgroundImage: 'url("/survival/sprites/character.png")',
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "contain",
        backgroundColor: "transparent",
        transform:
          animationState === "jump"
            ? "translateX(-50%) translateY(-20px)"
            : animationState === "stumble"
              ? "translateX(-50%) rotate(10deg)"
              : "translateX(-50%) translateY(0)",
        opacity: animationState === "stumble" ? 0.7 : 1,
      }}
    />
  );
}
