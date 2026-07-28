import os

BASE_DIR = r"C:\Users\hkm44\OneDrive\바탕 화면\frontend\src"

directories = [
    "api",
    "assets/images", "assets/characters", "assets/icons", "assets/fonts", "assets/styles",
    "components/base", "components/common", "components/common/navigation", 
    "components/auth", "components/group", "components/challenge", "components/round",
    "components/money", "components/post", "components/account", "components/settlement",
    "components/pension", "components/survey", "components/recommendation", "components/calendar",
    "components/point", "components/collectible", "components/notification", "components/mypage",
    "composables", "constants", "layouts", "router", "stores", "utils",
    "views/auth", "views/home", "views/group", "views/round", "views/post", 
    "views/asset", "views/settlement", "views/calendar", "views/point", "views/collectible",
    "views/notification", "views/mypage", "views/error"
]

files = {
    "api": ["client.js", "auth.js", "user.js", "account.js", "group.js", "challenge.js", "round.js", "money.js", "post.js", "reaction.js", "settlement.js", "pension.js", "survey.js", "recommendation.js", "point.js", "collectible.js", "notification.js"],
    "assets/styles": ["reset.css", "variables.css", "global.css"],
    "components/base": ["BaseButton.vue", "BaseInput.vue", "BaseTextarea.vue", "BaseSelect.vue", "BaseModal.vue", "BaseSpinner.vue", "BaseEmptyState.vue"],
    "components/common": ["AppHeader.vue", "ConfirmModal.vue"],
    "components/common/navigation": ["AppNavigation.vue", "DesktopSidebar.vue", "MobileBottomNav.vue", "PixelNavIcon.vue"],
    "components/auth": ["LoginForm.vue", "SignupForm.vue", "AccountRegistrationForm.vue"],
    "components/group": ["GroupCard.vue", "GroupForm.vue", "GroupInfo.vue", "MemberList.vue", "InviteModal.vue"],
    "components/challenge": ["ChallengeForm.vue", "ChallengeSummary.vue"],
    "components/round": ["RoundCard.vue", "RoundHistory.vue", "RoundResultCard.vue", "RankingBoard.vue", "RankingItem.vue"],
    "components/money": ["DepositStatus.vue", "DepositModal.vue", "GroupAccountSummary.vue", "TransactionList.vue"],
    "components/post": ["FeedCard.vue", "FeedForm.vue", "FeedImage.vue", "FeedFilter.vue", "ApprovalButtons.vue", "RejectModal.vue", "CommentList.vue", "CommentItem.vue"],
    "components/account": ["AccountCard.vue", "AccountForm.vue", "SettlementAccountSelector.vue"],
    "components/settlement": ["SettlementSummary.vue", "SettlementHistoryList.vue", "SettlementStatus.vue"],
    "components/pension": ["PensionAccountCard.vue", "PensionHistoryList.vue"],
    "components/survey": ["SurveyForm.vue", "QuestionCard.vue", "SurveyResultCard.vue"],
    "components/recommendation": ["RecommendationCard.vue", "PortfolioChart.vue", "ProductCard.vue"],
    "components/calendar": ["ChallengeCalendar.vue", "CalendarFilter.vue", "CalendarFeedList.vue"],
    "components/point": ["PointSummary.vue", "PointHistoryList.vue"],
    "components/collectible": ["CharacterPreview.vue", "InventoryGrid.vue", "CollectibleCard.vue", "GachaModal.vue", "EquipButton.vue"],
    "components/notification": ["NotificationList.vue", "NotificationItem.vue"],
    "components/mypage": ["ProfileCard.vue", "ActivitySummary.vue", "ProfileForm.vue", "PasswordForm.vue", "SettingsMenu.vue"],
    "composables": ["useModal.js", "useImageUpload.js"],
    "constants": ["navigation.js", "challenge.js", "status.js"],
    "layouts": ["DefaultLayout.vue", "AuthLayout.vue"],
    "router": ["index.js", "guards.js"],
    "stores": ["auth.js", "group.js", "round.js", "notification.js", "point.js"],
    "utils": ["date.js", "format.js", "validation.js", "storage.js"],
    "views/auth": ["LoginView.vue", "SignupView.vue"],
    "views/home": ["HomeView.vue"],
    "views/group": ["GroupDetailView.vue", "GroupCreateView.vue", "GroupEditView.vue", "GroupJoinView.vue"],
    "views/round": ["RoundDetailView.vue"],
    "views/post": ["FeedView.vue", "FeedDetailView.vue", "FeedWriteView.vue"],
    "views/asset": ["AssetView.vue", "AccountView.vue", "GroupAccountView.vue", "PensionView.vue", "SurveyView.vue", "RecommendationView.vue"],
    "views/settlement": ["SettlementView.vue"],
    "views/calendar": ["CalendarView.vue"],
    "views/point": ["PointView.vue"],
    "views/collectible": ["InventoryView.vue"],
    "views/notification": ["NotificationView.vue"],
    "views/mypage": ["MyPageView.vue", "ProfileEditView.vue", "SettingsView.vue"],
    "views/error": ["NotFoundView.vue"]
}

def create_vue_template(name):
    return f"""<template>
  <div class="{name.lower().replace('.vue', '')}">
    <!-- {name} -->
  </div>
</template>

<script setup>
</script>

<style scoped>
</style>
"""

def create_js_template(name):
    if name == "index.js" and "router" in name: # naive check
        pass # we'll handle router specially later, but for now simple export
    return f"// {name}\nexport const dummy = '{name}';\n"

for d in directories:
    os.makedirs(os.path.join(BASE_DIR, d), exist_ok=True)

for folder, file_list in files.items():
    for f in file_list:
        file_path = os.path.join(BASE_DIR, folder, f)
        if not os.path.exists(file_path):
            with open(file_path, "w", encoding="utf-8") as file:
                if f.endswith(".vue"):
                    file.write(create_vue_template(f))
                elif f.endswith(".js"):
                    file.write(create_js_template(f))
                elif f.endswith(".css"):
                    file.write(f"/* {f} */\n")

print("Scaffold completed.")
