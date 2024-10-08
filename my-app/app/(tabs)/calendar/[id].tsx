import React from 'react';
import {View, Text, StyleSheet, ImageBackground, ScrollView, ActivityIndicator, Image, TextInput} from 'react-native';
import {PageHeader} from "@/components/PageHeader";
import {useLocalSearchParams } from 'expo-router';
import {API_BASE} from "@/config/env";
import axios from "axios";
import {formatDate} from "@/utils/formatted";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {BackgroundTitle} from "@/components/BackgroundTitle";
import CommentForm from "@/components/CommentForm";
import {InlineFlashError} from "@/components/InlineFlashError";

const image = require('../../../assets/images/nfs-project-background.png');
const avatar = require('../../../assets/images/avatar.png');

export default function CalendarScreen() {
  const { id } = useLocalSearchParams();
  const [event, setEvent] = React.useState<Evenement>();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [comments, setComments] = React.useState<Commentaire[]>([]);
  const [error, setError] = React.useState<string|null>(null);

  const fetchEvent = async (id: string | string[]) => {
    try {
      const response = await axios.get(`${API_BASE}/event/${id}`);
      if (response.data) {
        setEvent(JSON.parse(response.data));
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Une erreur est survenue', error);
    }
  }

  const fetchEventComments = async (id: string | string[]) => {
    try {
      const response = await axios.get(`${API_BASE}/comments?eventId=${id}`);
      if (response.data) {
        setComments(JSON.parse(response.data))
      }
    } catch (error) {
      setError("Une erreur est survenue lors du chargement des commentaires")
      console.error('Une erreur est survenue', error);
    }
  }

  React.useEffect(() => {
    fetchEvent(id);
    fetchEventComments(id);
  }, [id]);

  return (
    <View style={styles.container}>
      <ImageBackground source={image} resizeMode="cover" style={styles.image}>
        {/* HEADER RECHERCHE */}
        <View style={{paddingHorizontal:20, paddingTop: 50}}>
          <PageHeader isLogo={true} />
        </View>
        <ScrollView>
          { event && !isLoading ?
            <View style={styles.detailContainer}>
              <Image source={avatar} resizeMode={"cover"} style={styles.avatarImage}/>
              <MaterialCommunityIcons name="heart-multiple-outline" size={38} color="black" />
              {/* ENTETE */}
              <View>
                <Text style={styles.title}>{event.name}</Text>
                <View style={styles.pillContainer}>
                  <Text style={styles.pill}>{formatDate(event.date.toString(), 'DD/MM - HH:mm')}</Text>
                  <Text style={styles.pill}>{event.type}</Text>
                </View>
              </View>
              {/* PRESENTATION */}
              <View style={{marginTop:60}}>
                <BackgroundTitle label={"Présentation"} />
                <View style={{marginBottom:59}}>
                  <Text style={styles.text}>{event.description}</Text>
                </View>
              </View>
              {/* INTERVENANT */}
              <View>
                <BackgroundTitle label={"Intervenants"} />
                <View style={{marginBottom:59}}>
                  {
                    (event?.artists || []).map((artist: any, index: number) => (
                      <View key={index}>
                        <Text style={{fontFamily:"BebasNeue", marginTop:10}}>{artist.name}</Text>
                        <Text style={styles.text}>{artist.description}</Text>
                      </View>
                    ))
                  }
                </View>
              </View>
              {/* AVIS */}
              <View style={{marginBottom:30}}>
                <BackgroundTitle label={"Avis"} />
                {
                  !error ? (
                    <>
                        {
                          (comments || []).map((comment: any, index: number) => (
                            <View key={index}>
                              <Text style={{fontFamily:"BebasNeue"}}>{comment.author} a dit :</Text>
                              <Text style={styles.content}>{comment.content}</Text>
                              <Text style={styles.date}>Le {formatDate(comment.createdAt, 'DD/MM/YYYY - HH:mm')}</Text>
                            </View>
                          ))
                        }
                        <View>
                          <CommentForm eventId={id} setComments={setComments} />
                        </View>
                    </>
                  ) : (
                    <InlineFlashError message={error} />
                  )
                }
              </View>
            </View>
             : <ActivityIndicator size="large" color="#0000ff" />
          }
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "Poppins",
    fontSize: 16
  },
  title: {
    fontFamily: "BebasNeue",
    fontSize: 35,
    textAlign: "center",
    marginBottom: 15,
    marginTop: 20
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  avatarImage: {
    position: "absolute",
    top: -40,
    width: 100,
    height: 100,
    resizeMode: "cover",
    left: "47%",
    zIndex: 10,
  },
  image: {
    flex: 1
  },
  detailContainer: {
    flex: 1,
    position: "relative",
    paddingHorizontal: 30,
    paddingTop: 27,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 82,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, .8)"
  },
  pillContainer: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  pill: {
    backgroundColor: "#BEB8AC",
    color: "#fff",
    fontFamily: "Poppins",
    borderRadius: 50,
    paddingVertical: 5,
    paddingHorizontal: 15,
    textAlign: "center",
    marginRight: 10,
    fontSize: 12
  },
  content: {
    fontFamily: "Poppins",
    fontSize: 12
  },
  date: {
    fontFamily: "Poppins",
    fontSize: 10
  }
});
