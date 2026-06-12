import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { learnArticles, LearnArticle } from "@/data/learnArticles";
import { colors, spacing, typography } from "@/theme";

export default function LearnTab() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Learn</Text>
          <Text style={styles.title}>Calm explanations for common moments</Text>
          <Text style={styles.body}>
            Short articles you can open only when you want more context.
          </Text>
        </View>

        <View style={styles.articleList}>
          {learnArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ArticleCard({ article }: { article: LearnArticle }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.articleCard}>
      <Pressable
        onPress={() => setExpanded((value) => !value)}
        style={styles.articleHeader}
      >
        <View style={styles.articleHeaderText}>
          <Text style={styles.articleMeta}>
            {article.category} · {article.durationLabel}
          </Text>

          <Text style={styles.articleTitle}>{article.title}</Text>
        </View>

        <Text style={styles.expandIcon}>{expanded ? "−" : "+"}</Text>
      </Pressable>

      <Text style={styles.articleSummary}>{article.summary}</Text>

      {expanded ? <Text style={styles.articleBody}>{article.body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    gap: spacing.xl,
    padding: spacing.xl,
    paddingBottom: 108
  },
  header: {
    gap: spacing.sm
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.textSecondary
  },
  title: {
    ...typography.title,
    color: colors.textPrimary
  },
  body: {
    ...typography.body,
    color: colors.textSecondary
  },
  articleList: {
    gap: spacing.md
  },
  articleCard: {
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  articleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  articleHeaderText: {
    flex: 1,
    gap: spacing.xs
  },
  articleMeta: {
    ...typography.caption,
    color: colors.textSecondary
  },
  articleTitle: {
    ...typography.section,
    color: colors.textPrimary
  },
  articleSummary: {
    ...typography.body,
    color: colors.textSecondary
  },
  articleBody: {
    ...typography.body,
    color: colors.textPrimary
  },
  expandIcon: {
    color: colors.primaryBlue,
    fontSize: 26,
    lineHeight: 28
  }
});