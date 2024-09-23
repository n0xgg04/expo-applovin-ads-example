import {Image, StyleSheet, Platform, Button} from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {AdDisplayFailedInfo, AdInfo, AdLoadFailedInfo, AdRewardInfo, RewardedAd} from "react-native-applovin-max";
import {useEffect, useRef} from "react";

const REWARDED_AD_UNIT_ID = Platform.select({
    android: 'UNIT_ID',
    ios: 'UNIT_ID',
});


export default function HomeScreen() {
    const MAX_EXPONENTIAL_RETRY_COUNT = 6;
    const retryAttempt = useRef(0);

    // READ AT: https://developers.applovin.com/en/max/react-native/ad-formats/rewarded-ads/
    const initializeRewardedAds = () => {
        RewardedAd.addAdLoadedEventListener((adInfo: AdInfo) => {
            retryAttempt.current = 0;
        });
        RewardedAd.addAdLoadFailedEventListener((errorInfo: AdLoadFailedInfo) => {

            retryAttempt.current += 1;
            if (retryAttempt.current > MAX_EXPONENTIAL_RETRY_COUNT) return;
            const retryDelay = Math.pow(2, Math.min(MAX_EXPONENTIAL_RETRY_COUNT, retryAttempt.current));

            console.log('Rewarded ad failed to load - retrying in ' + retryDelay + 's');

            setTimeout(() => {
                loadRewardedAd();
            }, retryDelay * 1000);
        });
        RewardedAd.addAdFailedToDisplayEventListener((adInfo: AdDisplayFailedInfo) => {
            loadRewardedAd();
        });
        RewardedAd.addAdHiddenEventListener((adInfo: AdInfo) => {
            loadRewardedAd();
        });
        RewardedAd.addAdReceivedRewardEventListener((adInfo: AdRewardInfo) => {
        });

        loadRewardedAd();
    }

    const loadRewardedAd = () => {
        RewardedAd.loadAd(REWARDED_AD_UNIT_ID!);
    }

    useEffect(() => {
        initializeRewardedAds()
    }, []);

    const openRewardedAds = async() => {
        const isRewardedAdReady = await RewardedAd.isAdReady(REWARDED_AD_UNIT_ID!);
        if (isRewardedAdReady) {
            RewardedAd.showAd(REWARDED_AD_UNIT_ID!);
        }
    }
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Applovin Expo Example</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Rewarded Ads</ThemedText>
        <ThemedText>
          Click below button
        </ThemedText>
          <Button onPress={() => openRewardedAds()} title={"Open rewarded ads"}/>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
