package com.dokanapp

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.modules.network.OkHttpClientProvider
import java.net.Inet4Address
import java.net.InetAddress
import okhttp3.Dns

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()

    OkHttpClientProvider.setOkHttpClientFactory {
      OkHttpClientProvider.createClientBuilder(applicationContext)
        .dns(
          object : Dns {
            override fun lookup(hostname: String): List<InetAddress> {
              val addresses = Dns.SYSTEM.lookup(hostname)
              val ipv4Addresses = addresses.filterIsInstance<Inet4Address>()

              return if (ipv4Addresses.isNotEmpty()) {
                ipv4Addresses
              } else {
                addresses
              }
            }
          }
        )
        .build()
    }

    loadReactNative(this)
  }
}
