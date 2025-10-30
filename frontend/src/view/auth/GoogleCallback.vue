<template>
  <div class="callback-container">
    <p class="info-text">{{ t('auth.googleLoginFailed') }}</p>
    <a-button type="primary" @click="goToLogin">{{ t('auth.backToLogin') }}</a-button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

const goToLogin = () => {
  router.push({ name: 'login' });
};
</script>

<style scoped>
.callback-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 24px;
  background: rgba(255, 255, 255, 0.9);
  text-align: center;
}

.info-text {
  font-size: 18px;
  color: #4f46e5;
  max-width: 360px;
}
</style>